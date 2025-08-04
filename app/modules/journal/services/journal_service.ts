import { v4 as uuidv4 } from 'uuid'
import JournalEntry from '#models/journal_entry'
import { StructuredLogger } from '#services/structured_logger'
import type { 
  CreateJournalEntryDto, 
  UpdateJournalEntryDto, 
  GetEntriesFiltersDto,
  GetPromptsFiltersDto,
  JournalEntryResponseDto,
  JournalPromptResponseDto,
  JournalStatsResponseDto
} from '../dtos/journal_dtos.js'

export class JournalService {
  
  /**
   * Create a new journal entry
   */
  static async createEntry(userId: string, data: CreateJournalEntryDto): Promise<JournalEntryResponseDto> {
    try {
      // Create entry in database
      const entry = await JournalEntry.create({
        id: uuidv4(),
        userId,
        title: data.title || 'Untitled Entry',
        content: data.content,
        mood: null,
        tags: null,
        prompts: null,
        metadata: data.metadata || null,
        isFavorite: false
      })

      // Return formatted response
      return {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        moodTags: [],
        category: 'personal',
        wordCount: this.countWords(entry.content),
        characterCount: entry.content.length,
        readingTime: Math.ceil(this.countWords(entry.content) / 200),
        emotions: {
          joy: 0.1,
          sadness: 0.1,
          anger: 0.1,
          fear: 0.1,
          surprise: 0.1,
          disgust: 0.5
        },
        keywords: this.extractKeywords(entry.content),
        themes: this.extractThemes(entry.content),
        privacy: {
          level: 'private',
          shareWithTherapist: false
        },
        createdAt: entry.createdAt?.toISO() || new Date().toISOString(),
        updatedAt: entry.updatedAt?.toISO() || new Date().toISOString()
      }
    } catch (error) {
      console.error('Error creating journal entry:', error)
      throw new Error('Failed to create journal entry')
    }
  }

  /**
   * Get journal entries with filters
   */
  static async getEntries(userId: string, filters: GetEntriesFiltersDto): Promise<{
    entries: JournalEntryResponseDto[]
    total: number
    hasMore: boolean
  }> {
    try {
      const query = JournalEntry.query().where('userId', userId)

      // Apply filters
      if (filters.category) {
        // Use LIKE for category filtering since we don't have mood in our schema
        query.where('content', 'like', `%${filters.category}%`)
      }
      if (filters.startDate) {
        query.where('createdAt', '>=', filters.startDate)
      }
      if (filters.endDate) {
        query.where('createdAt', '<=', filters.endDate)
      }
      if (filters.search) {
        query.where((builder) => {
          builder.where('title', 'like', `%${filters.search}%`)
                 .orWhere('content', 'like', `%${filters.search}%`)
        })
      }

      // Pagination
      const limit = filters.limit || 10
      const offset = filters.offset || 0
      
      query.limit(limit + 1).offset(offset)
      query.orderBy('createdAt', 'desc')

      const entries = await query.exec()
      const hasMore = entries.length > limit
      
      if (hasMore) {
        entries.pop()
      }

      const total = await JournalEntry.query().where('userId', userId).count('* as total')

      return {
        entries: entries.map(entry => this.mapEntryToResponseDto(entry)),
        total: parseInt(total[0].$extras.total),
        hasMore
      }
    } catch (error) {
      console.error('Error getting journal entries:', error)
      // Return empty result as fallback
      return {
        entries: [],
        total: 0,
        hasMore: false
      }
    }
  }

  /**
   * Get a journal entry by ID
   */
  static async getEntryById(userId: string, entryId: string): Promise<JournalEntryResponseDto | null> {
    try {
      const entry = await JournalEntry.query()
        .where('id', entryId)
        .where('userId', userId)
        .first()

      if (!entry) {
        return null
      }

      return this.mapEntryToResponseDto(entry)
    } catch (error) {
      console.error('Error getting journal entry:', error)
      return null
    }
  }

  /**
   * Update a journal entry
   */
  static async updateEntry(userId: string, entryId: string, data: UpdateJournalEntryDto): Promise<JournalEntryResponseDto | null> {
    try {
      const entry = await JournalEntry.query()
        .where('id', entryId)
        .where('userId', userId)
        .first()

      if (!entry) {
        return null
      }

      // Update fields
      if (data.title !== undefined) entry.title = data.title
      if (data.content !== undefined) entry.content = data.content
      if (data.category !== undefined) {
        // Store category in metadata since we don't have a direct category field
        entry.metadata = { ...entry.metadata, category: data.category }
      }
      if (data.moodTagIds !== undefined) {
        // Store mood tags in metadata
        entry.metadata = { ...entry.metadata, moodTagIds: data.moodTagIds }
      }

      await entry.save()

      return this.mapEntryToResponseDto(entry)
    } catch (error) {
      console.error('Error updating journal entry:', error)
      return null
    }
  }

  /**
   * Delete a journal entry
   */
  static async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      const deleted = await JournalEntry.query()
        .where('id', entryId)
        .where('userId', userId)
        .delete()

      return deleted.length > 0
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      return false
    }
  }

  /**
   * Get journal prompts
   */
  static async getPrompts(_filters: GetPromptsFiltersDto): Promise<JournalPromptResponseDto[]> {
    // Mock data for now - TODO: implement database storage for prompts
    const mockPrompts: JournalPromptResponseDto[] = [
      {
        id: uuidv4(),
        question: "What are three things you're grateful for today?",
        category: "gratitude",
        difficulty: "easy",
        type: "standard",
        estimatedTime: 5,
        benefits: ["gratitude", "reflection"],
        tags: ["gratitude", "reflection"],
        isPremium: false
      },
      {
        id: uuidv4(),
        question: "Describe a challenge you faced recently and how you overcame it.",
        category: "growth",
        difficulty: "medium", 
        type: "standard",
        estimatedTime: 10,
        benefits: ["challenge", "growth", "resilience"],
        tags: ["challenge", "growth", "resilience"],
        isPremium: false
      }
    ]

    return mockPrompts
  }

  /**
   * Search journal entries with advanced full-text search
   */
  static async searchEntries(userId: string, query: string, filters?: {
    limit?: number
    offset?: number
    category?: string
    startDate?: string
    endDate?: string
    sortBy?: 'relevance' | 'date' | 'title'
    sortOrder?: 'asc' | 'desc'
  }): Promise<JournalEntryResponseDto[]> {
    try {
      const startTime = Date.now()
      
      // Log search query for analytics
      StructuredLogger.business('Journal search performed', {
        action: 'search_entries',
        entityType: 'journal_entry',
        userId,
        query: query.length > 100 ? query.substring(0, 100) + '...' : query,
        queryLength: query.length
      })

      // Prepare search terms
      const searchTerms = this.prepareSearchTerms(query)
      
      const searchQuery = JournalEntry.query()
        .where('userId', userId)

      // Apply advanced search logic
      if (searchTerms.exactPhrase) {
        // Exact phrase search
        searchQuery.where((builder) => {
          builder
            .whereILike('title', `%${searchTerms.exactPhrase}%`)
            .orWhereILike('content', `%${searchTerms.exactPhrase}%`)
        })
      } else if (searchTerms.words.length > 0) {
        // Multi-word search with ranking
        searchQuery.where((builder) => {
          for (const word of searchTerms.words) {
            builder.orWhere((subBuilder) => {
              subBuilder
                .whereILike('title', `%${word}%`)
                .orWhereILike('content', `%${word}%`)
            })
          }
        })
      }

      // Apply additional filters
      if (filters?.category) {
        searchQuery.where('category', filters.category)
      }
      if (filters?.startDate) {
        searchQuery.where('createdAt', '>=', filters.startDate)
      }
      if (filters?.endDate) {
        searchQuery.where('createdAt', '<=', filters.endDate)
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'date'
      const sortOrder = filters?.sortOrder || 'desc'
      
      if (sortBy === 'relevance') {
        // For relevance, we'll use a simple scoring system
        // In a production system, you might want to use a proper search engine
        searchQuery.orderByRaw(`
          CASE 
            WHEN LOWER(title) LIKE LOWER(?) THEN 4
            WHEN LOWER(title) LIKE LOWER(?) THEN 3
            WHEN LOWER(content) LIKE LOWER(?) THEN 2
            ELSE 1
          END DESC,
          created_at DESC
        `, [
          `%${query}%`,
          `%${query.split(' ')[0]}%`,
          `%${query}%`
        ])
      } else if (sortBy === 'date') {
        searchQuery.orderBy('createdAt', sortOrder)
      } else if (sortBy === 'title') {
        searchQuery.orderBy('title', sortOrder)
      }

      // Apply pagination
      const limit = Math.min(filters?.limit || 20, 100) // Max 100 results
      const offset = filters?.offset || 0
      
      searchQuery.limit(limit).offset(offset)

      const entries = await searchQuery.exec()
      const results = entries.map(entry => this.mapEntryToResponseDto(entry))

      // Log performance metrics
      const duration = Date.now() - startTime
      StructuredLogger.performance('Journal search completed', {
        operation: 'search_entries',
        duration,
        userId,
        resultCount: results.length,
        queryComplexity: searchTerms.words.length + (searchTerms.exactPhrase ? 1 : 0)
      })

      return results
    } catch (error) {
      StructuredLogger.error('Error searching journal entries', error, {
        userId,
        query: query.substring(0, 100)
      })
      return []
    }
  }

  /**
   * Prepare search terms for advanced search
   */
  private static prepareSearchTerms(query: string): {
    words: string[]
    exactPhrase: string | null
    excludeWords: string[]
  } {
    // Check for exact phrase search (quoted text)
    const exactPhraseMatch = query.match(/"([^"]+)"/);
    const exactPhrase = exactPhraseMatch ? exactPhraseMatch[1] : null

    // Remove quoted phrases from query for word extraction
    let cleanQuery = query.replace(/"[^"]+"/g, '').trim()

    // Extract words to exclude (prefixed with -)
    const excludeWords = (cleanQuery.match(/-\w+/g) || [])
      .map(word => word.substring(1).toLowerCase())
    
    // Remove exclude words from query
    cleanQuery = cleanQuery.replace(/-\w+/g, '').trim()

    // Extract regular words (min 2 characters, max 50 characters)
    const words = cleanQuery
      .split(/\s+/)
      .filter(word => word.length >= 2 && word.length <= 50)
      .map(word => word.toLowerCase())
      .filter(word => !excludeWords.includes(word))

    return {
      words: [...new Set(words)], // Remove duplicates
      exactPhrase,
      excludeWords
    }
  }

  /**
   * Get search suggestions based on user's journal history
   */
  static async getSearchSuggestions(userId: string, partialQuery: string): Promise<string[]> {
    try {
      if (partialQuery.length < 2) return []

      const suggestions = await JournalEntry.query()
        .where('userId', userId)
        .where((builder) => {
          builder
            .whereILike('title', `%${partialQuery}%`)
            .orWhereILike('content', `%${partialQuery}%`)
        })
        .select('title')
        .distinct()
        .limit(10)
        .exec()

      // Extract relevant words from titles
      const words = new Set<string>()
      suggestions.forEach(entry => {
        const titleWords = entry.title
          .toLowerCase()
          .split(/\s+/)
          .filter(word => 
            word.includes(partialQuery.toLowerCase()) && 
            word.length >= partialQuery.length
          )
        titleWords.forEach(word => words.add(word))
      })

      return Array.from(words).slice(0, 5)
    } catch (error) {
      StructuredLogger.error('Error getting search suggestions', error, { userId })
      return []
    }
  }

  /**
   * Get journal statistics
   */
  static async getJournalStats(userId: string): Promise<JournalStatsResponseDto> {
    try {
      const totalEntries = await JournalEntry.query().where('userId', userId).count('* as total')
      const totalWords = await JournalEntry.query()
        .where('userId', userId)
        .select('content')
        .exec()

      const wordCount = totalWords.reduce((sum, entry) => sum + this.countWords(entry.content), 0)

      return {
        totalEntries: parseInt(totalEntries[0].$extras.total),
        totalWords: wordCount,
        averageWordsPerEntry: Math.round(wordCount / Math.max(parseInt(totalEntries[0].$extras.total), 1)),
        currentStreak: 0, // TODO: implement streak calculation
        longestStreak: 0, // TODO: implement longest streak calculation
        entriesThisWeek: 0,
        entriesThisMonth: 0,
        favoriteCategory: 'personal',
        mostUsedMoodTags: [],
        moodTrends: [],
        writingPatterns: {
          hourOfDay: {},
          dayOfWeek: {},
          wordsPerDay: {}
        }
      }
    } catch (error) {
      console.error('Error getting journal stats:', error)
      return {
        totalEntries: 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        currentStreak: 0,
        longestStreak: 0,
        entriesThisWeek: 0,
        entriesThisMonth: 0,
        favoriteCategory: 'personal',
        mostUsedMoodTags: [],
        moodTrends: [],
        writingPatterns: {
          hourOfDay: {},
          dayOfWeek: {},
          wordsPerDay: {}
        }
      }
    }
  }

  /**
   * Helper method to map entry to response DTO
   */
  private static mapEntryToResponseDto(entry: any): JournalEntryResponseDto {
    return {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      moodTags: [],
      category: 'personal',
      wordCount: this.countWords(entry.content),
      characterCount: entry.content.length,
      readingTime: Math.ceil(this.countWords(entry.content) / 200),
      emotions: {
        joy: 0.1,
        sadness: 0.1,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.1,
        disgust: 0.5
      },
      keywords: this.extractKeywords(entry.content),
      themes: this.extractThemes(entry.content),
      privacy: {
        level: 'private',
        shareWithTherapist: false
      },
      createdAt: entry.createdAt?.toJSDate?.() || new Date().toISOString(),
      updatedAt: entry.updatedAt?.toJSDate?.() || new Date().toISOString()
    }
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Analyze emotions (mock implementation)
   */
  private static analyzeEmotions(_text: string) {
    // Mock emotion analysis
    return {
      dominant: 'neutral',
      confidence: 0.7,
      emotions: {
        joy: 0.1,
        sadness: 0.1,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.1,
        neutral: 0.5
      }
    }
  }

  /**
   * Extract keywords (mock implementation)
   */
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\s+/)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'do', 'does', 'did', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those']
    
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .reduce((acc: any, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})

    return Object.keys(keywords)
      .sort((a, b) => keywords[b] - keywords[a])
      .slice(0, 5)
  }

  /**
   * Extract themes (mock implementation)
   */
  private static extractThemes(text: string): string[] {
    // Mock theme extraction
    const themes = []
    if (text.toLowerCase().includes('work') || text.toLowerCase().includes('job')) themes.push('work')
    if (text.toLowerCase().includes('family') || text.toLowerCase().includes('parent')) themes.push('family')
    if (text.toLowerCase().includes('friend') || text.toLowerCase().includes('social')) themes.push('relationships')
    if (text.toLowerCase().includes('health') || text.toLowerCase().includes('exercise')) themes.push('health')
    if (text.toLowerCase().includes('goal') || text.toLowerCase().includes('achievement')) themes.push('goals')
    
    return themes.length > 0 ? themes : ['personal']
  }
}

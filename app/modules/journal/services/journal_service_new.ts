import { v4 as uuidv4 } from 'uuid'
import JournalEntry from '#models/journal_entry'
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
        mood: data.mood || null,
        tags: data.tags || null,
        prompts: data.prompts || null,
        metadata: data.metadata || null,
        isFavorite: data.isFavorite || false
      })

      // Return formatted response
      return {
        id: entry.id,
        userId: entry.userId,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        prompts: entry.prompts || [],
        wordCount: this.countWords(entry.content),
        characterCount: entry.content.length,
        isFavorite: entry.isFavorite,
        metadata: entry.metadata || {},
        emotions: this.analyzeEmotions(entry.content),
        keywords: this.extractKeywords(entry.content),
        themes: this.extractThemes(entry.content),
        createdAt: entry.createdAt.toJSDate(),
        updatedAt: entry.updatedAt.toJSDate()
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
      if (filters.mood) {
        query.where('mood', filters.mood)
      }
      if (filters.startDate) {
        query.where('createdAt', '>=', filters.startDate)
      }
      if (filters.endDate) {
        query.where('createdAt', '<=', filters.endDate)
      }
      if (filters.isFavorite !== undefined) {
        query.where('isFavorite', filters.isFavorite)
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
      if (data.mood !== undefined) entry.mood = data.mood
      if (data.tags !== undefined) entry.tags = data.tags
      if (data.prompts !== undefined) entry.prompts = data.prompts
      if (data.metadata !== undefined) entry.metadata = data.metadata
      if (data.isFavorite !== undefined) entry.isFavorite = data.isFavorite

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

      return deleted > 0
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      return false
    }
  }

  /**
   * Get journal prompts
   */
  static async getPrompts(filters: GetPromptsFiltersDto): Promise<JournalPromptResponseDto[]> {
    // Mock data for now - TODO: implement database storage for prompts
    const mockPrompts = [
      {
        id: uuidv4(),
        text: "What are three things you're grateful for today?",
        category: "gratitude",
        difficulty: "easy",
        tags: ["gratitude", "reflection"]
      },
      {
        id: uuidv4(),
        text: "Describe a challenge you faced recently and how you overcame it.",
        category: "growth",
        difficulty: "medium",
        tags: ["challenge", "growth", "resilience"]
      },
      {
        id: uuidv4(),
        text: "What emotions are you feeling right now, and what might be causing them?",
        category: "emotional",
        difficulty: "medium",
        tags: ["emotions", "self-awareness"]
      }
    ]

    return mockPrompts
  }

  /**
   * Search journal entries
   */
  static async searchEntries(userId: string, query: string, filters?: any): Promise<JournalEntryResponseDto[]> {
    try {
      const searchQuery = JournalEntry.query()
        .where('userId', userId)
        .where((builder) => {
          builder
            .whereILike('title', `%${query}%`)
            .orWhereILike('content', `%${query}%`)
        })
        .orderBy('createdAt', 'desc')
        .limit(20)

      const entries = await searchQuery.exec()
      return entries.map(entry => this.mapEntryToResponseDto(entry))
    } catch (error) {
      console.error('Error searching journal entries:', error)
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
        streakDays: 0, // TODO: implement streak calculation
        longestStreak: 0, // TODO: implement longest streak calculation
        moodDistribution: {}, // TODO: implement mood analysis
        writingFrequency: {
          thisWeek: 0,
          thisMonth: 0,
          thisYear: parseInt(totalEntries[0].$extras.total)
        }
      }
    } catch (error) {
      console.error('Error getting journal stats:', error)
      return {
        totalEntries: 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        streakDays: 0,
        longestStreak: 0,
        moodDistribution: {},
        writingFrequency: {
          thisWeek: 0,
          thisMonth: 0,
          thisYear: 0
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
      userId: entry.userId,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      prompts: entry.prompts || [],
      wordCount: this.countWords(entry.content),
      characterCount: entry.content.length,
      isFavorite: entry.isFavorite,
      metadata: entry.metadata || {},
      emotions: this.analyzeEmotions(entry.content),
      keywords: this.extractKeywords(entry.content),
      themes: this.extractThemes(entry.content),
      createdAt: entry.createdAt.toJSDate(),
      updatedAt: entry.updatedAt.toJSDate()
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
  private static analyzeEmotions(text: string) {
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

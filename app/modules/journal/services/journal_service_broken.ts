import { v4 as uuidv4 } from 'uuid'
import JournalEntry from '#models/journal_entry'
import type { JournalEntry as JournalEntityType, JournalPrompt } from '../entities/journal.js'
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
        metadata: entry.metadata || {
          deviceType: 'web',
          timezone: 'UTC',
          writingSession: {
            startTime: new Date(),
            endTime: new Date(),
            pauseCount: 0,
            revisionCount: 0
          }
        },
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
    // TODO: Implement database query with filters
    
    // Mock data for now
    const mockEntries = this.generateMockEntries(userId, 5)
    
    return {
      entries: mockEntries.map(entry => this.mapEntryToResponseDto(entry)),
      total: 25, // Mock total
      hasMore: true
    }
  }

  /**
   * Get entry by ID
   */
  static async getEntryById(userId: string, entryId: string): Promise<JournalEntryResponseDto | null> {
    // TODO: Implement database query
    // const entry = await JournalEntryRepository.findByIdAndUserId(entryId, userId)
    
    // Mock response
    const mockEntry = this.generateMockEntry(userId, entryId)
    return this.mapEntryToResponseDto(mockEntry)
  }

  /**
   * Update journal entry
   */
  static async updateEntry(userId: string, entryId: string, data: UpdateJournalEntryDto): Promise<JournalEntryResponseDto | null> {
    // TODO: Implement database update
    
    // Mock response - simulate update
    const mockEntry = this.generateMockEntry(userId, entryId)
    if (data.content) {
      mockEntry.content = data.content
      mockEntry.wordCount = this.countWords(data.content)
      mockEntry.characterCount = data.content.length
    }
    if (data.title) mockEntry.title = data.title
    if (data.moodTagIds) mockEntry.moodTagIds = data.moodTagIds
    mockEntry.updatedAt = new Date()

    return this.mapEntryToResponseDto(mockEntry)
  }

  /**
   * Delete journal entry
   */
  static async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    // TODO: Implement database delete
    // return await JournalEntryRepository.deleteByIdAndUserId(entryId, userId)
    
    // Mock response
    return true
  }

  /**
   * Get journal prompts
   */
  static async getPrompts(filters: GetPromptsFiltersDto): Promise<JournalPromptResponseDto[]> {
    // TODO: Implement database query
    
    // Mock prompts
    const mockPrompts = this.generateMockPrompts()
    return mockPrompts.map(prompt => this.mapPromptToResponseDto(prompt))
  }

  /**
   * Get random prompt
   */
  static async getRandomPrompt(filters: GetPromptsFiltersDto): Promise<JournalPromptResponseDto | null> {
    const prompts = await this.getPrompts(filters)
    if (prompts.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * prompts.length)
    return prompts[randomIndex]
  }

  /**
   * Search entries
   */
  static async searchEntries(userId: string, query: string, filters?: any): Promise<JournalEntryResponseDto[]> {
    // TODO: Implement full-text search
    
    // Mock search
    const mockEntries = this.generateMockEntries(userId, 3)
    return mockEntries.map(entry => this.mapEntryToResponseDto(entry))
  }

  /**
   * Get user journal statistics
   */
  static async getJournalStats(userId: string): Promise<JournalStatsResponseDto> {
    // TODO: Implement database aggregations
    
    // Mock stats
    return {
      totalEntries: 47,
      currentStreak: 5,
      longestStreak: 12,
      totalWords: 15420,
      averageWordsPerEntry: 328,
      entriesThisWeek: 4,
      entriesThisMonth: 18,
      favoriteCategory: 'gratitude',
      mostUsedMoodTags: [
        { id: '1', emoji: '😊', label: 'Happy', count: 15 },
        { id: '2', emoji: '😌', label: 'Calm', count: 12 },
        { id: '3', emoji: '🤔', label: 'Thoughtful', count: 8 }
      ],
      moodTrends: [
        { date: '2025-01-08', averageMood: 4.2, entries: 1 },
        { date: '2025-01-07', averageMood: 3.8, entries: 2 },
        { date: '2025-01-06', averageMood: 4.5, entries: 1 }
      ],
      writingPatterns: {
        hourOfDay: { '9': 5, '20': 8, '21': 12 },
        dayOfWeek: { 'monday': 3, 'tuesday': 5, 'sunday': 8 },
        wordsPerDay: { '2025-01-08': 245, '2025-01-07': 412 }
      }
    }
  }

  // Helper methods
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  private static analyzeSentiment(text: string) {
    // Mock sentiment analysis
    const positiveWords = ['good', 'great', 'happy', 'love', 'amazing', 'wonderful']
    const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'angry']
    
    const words = text.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.includes(word)).length
    const negativeCount = words.filter(word => negativeWords.includes(word)).length
    
    const score = (positiveCount - negativeCount) / Math.max(words.length, 1)
    const confidence = Math.min((positiveCount + negativeCount) / words.length, 1)
    
    let label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive'
    if (score > 0.1) label = 'positive'
    else if (score > 0.2) label = 'very_positive'
    else if (score < -0.1) label = 'negative'
    else if (score < -0.2) label = 'very_negative'
    else label = 'neutral'
    
    return { score, label, confidence }
  }

  private static analyzeEmotions(text: string) {
    // Mock emotion analysis
    return {
      joy: Math.random() * 0.5 + 0.2,
      sadness: Math.random() * 0.3,
      anger: Math.random() * 0.2,
      fear: Math.random() * 0.2,
      surprise: Math.random() * 0.3,
      disgust: Math.random() * 0.1
    }
  }

  private static extractKeywords(text: string): string[] {
    // Mock keyword extraction
    const commonWords = ['today', 'feel', 'work', 'life', 'time', 'family', 'happy', 'grateful']
    return commonWords.slice(0, Math.floor(Math.random() * 5) + 1)
  }

  private static extractThemes(text: string): string[] {
    // Mock theme extraction
    const themes = ['gratitude', 'relationships', 'work-life', 'personal-growth', 'health']
    return themes.slice(0, Math.floor(Math.random() * 3) + 1)
  }

  private static generateMockEntry(userId: string, entryId?: string): JournalEntry {
    return {
      id: entryId || uuidv4(),
      userId,
      title: 'Mock Journal Entry',
      content: 'This is a mock journal entry for testing purposes. Today I felt grateful for the progress I made on my projects.',
      category: 'gratitude',
      wordCount: 20,
      characterCount: 120,
      readingTime: 6,
      sentiment: { score: 0.3, label: 'positive', confidence: 0.7 },
      emotions: {
        joy: 0.6,
        sadness: 0.1,
        anger: 0.05,
        fear: 0.1,
        surprise: 0.1,
        disgust: 0.05
      },
      keywords: ['grateful', 'progress', 'projects'],
      themes: ['gratitude', 'personal-growth'],
      moodTagIds: ['1', '2'],
      privacy: { level: 'private', shareWithTherapist: false },
      metadata: {
        deviceType: 'phone',
        timezone: 'UTC',
        writingSession: {
          startTime: new Date(),
          endTime: new Date(),
          pauseCount: 0,
          revisionCount: 1
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private static generateMockEntries(userId: string, count: number): JournalEntry[] {
    return Array.from({ length: count }, () => this.generateMockEntry(userId))
  }

  private static generateMockPrompts(): JournalPrompt[] {
    return [
      {
        id: uuidv4(),
        question: 'What are three things you\'re grateful for today?',
        category: 'gratitude',
        difficulty: 'easy',
        type: 'standard',
        estimatedTime: 5,
        benefits: ['Increases positivity', 'Improves mood', 'Builds resilience'],
        instructions: ['Take a few deep breaths', 'Think about your day', 'Write freely'],
        tags: ['gratitude', 'positivity', 'daily'],
        icon: '🙏',
        isActive: true,
        isPremium: false,
        language: 'en',
        popularityScore: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  private static mapEntryToResponseDto(entry: JournalEntry): JournalEntryResponseDto {
    return {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      customPrompt: entry.customPrompt,
      moodTags: [], // TODO: Map from moodTagIds
      category: entry.category,
      subcategory: entry.subcategory,
      wordCount: entry.wordCount,
      characterCount: entry.characterCount,
      readingTime: entry.readingTime,
      sentiment: entry.sentiment,
      emotions: entry.emotions,
      keywords: entry.keywords,
      themes: entry.themes,
      privacy: entry.privacy,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString()
    }
  }

  private static mapPromptToResponseDto(prompt: JournalPrompt): JournalPromptResponseDto {
    return {
      id: prompt.id,
      question: prompt.question,
      category: prompt.category,
      subcategory: prompt.subcategory,
      difficulty: prompt.difficulty,
      type: prompt.type,
      estimatedTime: prompt.estimatedTime,
      benefits: prompt.benefits,
      instructions: prompt.instructions,
      tags: prompt.tags,
      icon: prompt.icon,
      isPremium: prompt.isPremium
    }
  }
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'
import type { MoodTag, JournalEntryMetadata } from '../types/journal_types.js'
import { calculateWordCount, calculateReadingTime, calculateSentimentScore } from '../types/journal_types.js'

export default class JournalEntry extends BaseModel {
  public static table = 'journal_entries'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare content: string

  @column()
  declare wordCount: number

  @column()
  declare readingTimeMinutes: number

  @column()
  declare promptId: string | null

  @column()
  declare promptCategory: string

  @column()
  declare customPrompt: string | null

  @column({
    serialize: (value) => value,
    prepare: (value: MoodTag[]) => value ? JSON.stringify(value) : '[]',
    consume: (value: string) => {
      if (!value) return [];
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      return value;
    }
  })
  declare moodTags: MoodTag[]

  @column()
  declare sentimentScore: number | null

  @column()
  declare isFavorite: boolean

  @column()
  declare privacyLevel: 'private' | 'shared' | 'anonymous'

  @column({
    serialize: (value) => value,
    prepare: (value: JournalEntryMetadata) => value ? JSON.stringify(value) : '{}',
    consume: (value: string) => {
      if (!value) return {};
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      }
      return value;
    }
  })
  declare metadata: JournalEntryMetadata

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Hooks
  @beforeSave()
  public static async calculateMetrics(journalEntry: JournalEntry) {
    if (!journalEntry.id) {
      journalEntry.id = uuidv4()
    }
    
    // Calculate word count and reading time
    if (journalEntry.content) {
      journalEntry.wordCount = calculateWordCount(journalEntry.content)
      journalEntry.readingTimeMinutes = calculateReadingTime(journalEntry.content)
      
      // Calculate sentiment score if not provided
      if (journalEntry.sentimentScore === undefined || journalEntry.sentimentScore === null) {
        journalEntry.sentimentScore = calculateSentimentScore(journalEntry.content)
      }
    }
  }

  // Scopes
  public static byUser(userId: string) {
    return this.query().where('userId', userId)
  }

  public static byCategory(category: string) {
    return this.query().where('promptCategory', category)
  }

  public static byPrivacyLevel(level: 'private' | 'shared' | 'anonymous') {
    return this.query().where('privacyLevel', level)
  }

  public static favorites() {
    return this.query().where('isFavorite', true)
  }

  public static byDateRange(startDate: DateTime, endDate: DateTime) {
    return this.query()
      .where('createdAt', '>=', startDate.toISO()!)
      .where('createdAt', '<=', endDate.toISO()!)
  }

  public static recent(days: number = 7) {
    const cutoffDate = DateTime.now().minus({ days }).toISO()!
    return this.query().where('createdAt', '>=', cutoffDate)
  }

  public static bySentiment(minScore: number, maxScore: number) {
    return this.query()
      .where('sentimentScore', '>=', minScore)
      .where('sentimentScore', '<=', maxScore)
  }

  public static search(query: string) {
    return this.query()
      .where('content', 'ilike', `%${query}%`)
      .orWhere('customPrompt', 'ilike', `%${query}%`)
  }

  // Helper methods
  public isPositive(): boolean {
    return this.sentimentScore !== null && this.sentimentScore > 0.2
  }

  public isNegative(): boolean {
    return this.sentimentScore !== null && this.sentimentScore < -0.2
  }

  public isNeutral(): boolean {
    return this.sentimentScore !== null && 
           this.sentimentScore >= -0.2 && 
           this.sentimentScore <= 0.2
  }

  public hasPositiveMoodTags(): boolean {
    return this.moodTags.some(tag => tag.category === 'positive')
  }

  public hasNegativeMoodTags(): boolean {
    return this.moodTags.some(tag => tag.category === 'negative')
  }

  public getWritingDuration(): number {
    return this.metadata?.writingDuration || 0
  }
}
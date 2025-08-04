import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'

// Types for mood system
export type MoodLevel = 'excelente' | 'bem' | 'neutro' | 'mal' | 'pessimo'
export type MoodPeriod = 'manha' | 'tarde' | 'noite'

export default class MoodEntry extends BaseModel {
  public static table = 'mood_entries'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare moodLevel: MoodLevel

  @column()
  declare period: MoodPeriod

  @column.date()
  declare date: DateTime

  @column()
  declare timestamp: number

  @column()
  declare notes: string | null

  @column({
    serialize: (value) => value,
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value) => {
      if (!value) return null;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [value]; // If it's not valid JSON, treat as single item array
        }
      }
      return value;
    }
  })
  declare activities: string[] | null

  @column({
    serialize: (value) => value,
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value) => {
      if (!value) return null;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return [value]; // If it's not valid JSON, treat as single item array
        }
      }
      return value;
    }
  })
  declare emotions: string[] | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Hooks
  @beforeSave()
  public static async generateId(moodEntry: MoodEntry) {
    if (!moodEntry.id) {
      moodEntry.id = uuidv4()
    }
    
    // Set timestamp if not provided
    if (!moodEntry.timestamp) {
      moodEntry.timestamp = Date.now()
    }
  }

  // Scopes
  public static byUser(userId: string) {
    return this.query().where('userId', userId)
  }

  public static byPeriod(period: MoodPeriod) {
    return this.query().where('period', period)
  }

  public static byDateRange(startDate: DateTime, endDate: DateTime) {
    return this.query()
      .where('date', '>=', startDate.toSQLDate()!)
      .where('date', '<=', endDate.toSQLDate()!)
  }

  public static recent(days: number = 7) {
    const cutoffDate = DateTime.now().minus({ days }).toSQLDate()!
    return this.query().where('date', '>=', cutoffDate)
  }

  public static byMoodLevel(moodLevel: MoodLevel) {
    return this.query().where('moodLevel', moodLevel)
  }

  // Helper methods
  public getMoodValue(): number {
    const values: Record<MoodLevel, number> = {
      'excelente': 5,
      'bem': 4,
      'neutro': 3,
      'mal': 2,
      'pessimo': 1
    }
    return values[this.moodLevel]
  }

  public isPositiveMood(): boolean {
    return this.moodLevel === 'excelente' || this.moodLevel === 'bem'
  }

  public needsSupport(): boolean {
    return this.moodLevel === 'mal' || this.moodLevel === 'pessimo'
  }
}
import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from '#models/user'

// Types for suggestion system
export type SuggestionCategory = 'mindfulness' | 'anxiety' | 'depression' | 'self-care' | 'productivity' | 'relationships'
export type SuggestionType = 'reading' | 'exercise' | 'meditation' | 'reflection'

export default class Suggestion extends BaseModel {
  public static table = 'suggestions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare summary: string

  @column()
  declare category: SuggestionCategory

  @column()
  declare type: SuggestionType

  @column()
  declare estimatedReadTime: number // in minutes

  @column()
  declare imageUrl: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async generateId(suggestion: Suggestion) {
    if (!suggestion.id) {
      suggestion.id = uuidv4()
    }
  }
}

export class UserSuggestion extends BaseModel {
  public static table = 'user_suggestions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare suggestionId: string

  @column.date()
  declare assignedDate: DateTime

  @column()
  declare isRead: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column()
  declare rating: number | null // 1-5 rating

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Suggestion, {
    foreignKey: 'suggestionId',
  })
  declare suggestion: BelongsTo<typeof Suggestion>

  @beforeSave()
  static async generateId(userSuggestion: UserSuggestion) {
    if (!userSuggestion.id) {
      userSuggestion.id = uuidv4()
    }
  }
}
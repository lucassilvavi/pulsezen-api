import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'

export default class UserProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare displayName: string | null

  @column()
  declare sex: 'MENINO' | 'MENINA' | 'OTHER' | null

  @column()
  declare age: number | null

  @column({
    prepare: (value: string[] | null) => {
      return value ? JSON.stringify(value) : null
    },
    consume: (value: string | null) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
  })
  declare goals: string[] | null

  @column()
  declare experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare onboardingCompleted: boolean

  // Onboarding data from mobile app
  @column.date()
  declare dateOfBirth: DateTime | null

  @column({
    prepare: (value: Record<string, any> | null) => {
      return value ? JSON.stringify(value) : null
    },
    consume: (value: string | null) => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
  })
  declare preferences: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Helper methods
  get fullName(): string | null {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`
    }
    return this.displayName || this.firstName || this.lastName || null
  }

  get isOnboardingComplete(): boolean {
    return this.onboardingCompleted && 
           !!this.firstName && 
           !!this.sex && 
           !!this.age &&
           !!this.goals?.length &&
           !!this.experienceLevel
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      fullName: this.fullName,
      sex: this.sex,
      age: this.age,
      goals: this.goals,
      experienceLevel: this.experienceLevel,
      avatarUrl: this.avatarUrl,
      onboardingCompleted: this.onboardingCompleted,
      isOnboardingComplete: this.isOnboardingComplete,
      preferences: this.preferences,
      dateOfBirth: this.dateOfBirth,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

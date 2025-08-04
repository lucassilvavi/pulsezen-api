import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import UserProfile from './user_profile.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column()
  declare passwordHash: string

  @column()
  declare emailVerified: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @hasOne(() => UserProfile)
  declare profile: HasOne<typeof UserProfile>

  // Helper methods
  async getOrCreateProfile() {
    let profile = await this.related('profile').query().first()
    
    if (!profile) {
      profile = await UserProfile.create({
        id: uuidv4(),
        userId: this.id,
        onboardingCompleted: false
      })
    }
    
    return profile
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      email: this.email,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
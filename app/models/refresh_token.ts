import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class RefreshToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare tokenHash: string

  @column()
  declare deviceFingerprint: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare ipAddress: string | null

  @column()
  declare isRevoked: boolean

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime()
  declare lastUsedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Check if refresh token is expired
   */
  get isExpired(): boolean {
    return this.expiresAt.toMillis() < Date.now()
  }

  /**
   * Check if refresh token is valid (not expired and not revoked)
   */
  get isValid(): boolean {
    return !this.isExpired && !this.isRevoked
  }
}

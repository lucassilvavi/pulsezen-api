import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import User from './user.js'
import UserDevice from './user_device.js'

export type BiometricType = 'faceId' | 'touchId' | 'fingerprint' | 'iris' | 'voice'

export interface BiometricData {
  templateHash?: string
  publicKey?: string
  challenge?: string
  signature?: string
  metadata?: Record<string, any>
}

export default class BiometricToken extends BaseModel {
  static table = 'biometric_tokens'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare deviceId: string

  @column()
  declare tokenHash: string

  @column()
  declare biometricType: BiometricType

  @column({
    serialize: (value: string | null) => {
      if (!value) return null
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch {
        return null
      }
    },
    consume: (value: BiometricData | null) => {
      if (!value) return null
      return typeof value === 'string' ? value : JSON.stringify(value)
    },
  })
  declare biometricData: BiometricData | null

  @column()
  declare challengeAttempts: number

  @column()
  declare successCount: number

  @column.dateTime()
  declare lastUsedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => UserDevice)
  declare device: BelongsTo<typeof UserDevice>

  // Hooks
  static async beforeCreate(token: BiometricToken) {
    if (!token.id) {
      token.id = uuidv4()
    }
  }

  // Helper methods
  static async generateToken(): Promise<string> {
    return uuidv4() + Date.now().toString(36)
  }

  static async hashToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 12)
  }

  static async verifyToken(token: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(token, hash)
  }

  async recordUsage() {
    this.lastUsedAt = DateTime.now()
    this.successCount += 1
    await this.save()
  }

  async recordAttempt() {
    this.challengeAttempts += 1
    await this.save()
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false
    return this.expiresAt < DateTime.now()
  }

  isValid(): boolean {
    return this.isActive && !this.isExpired()
  }

  async deactivate() {
    this.isActive = false
    await this.save()
  }

  async rotate(): Promise<string> {
    // Gera novo token
    const newToken = await BiometricToken.generateToken()
    const newHash = await BiometricToken.hashToken(newToken)
    
    // Atualiza token atual
    this.tokenHash = newHash
    this.challengeAttempts = 0
    this.expiresAt = DateTime.now().plus({ days: 30 })
    await this.save()
    
    return newToken
  }

  // Método estático para criar novo token biométrico
  static async createForDevice(
    userId: string,
    deviceId: string,
    biometricType: BiometricType,
    biometricData?: BiometricData
  ): Promise<{ token: BiometricToken; rawToken: string }> {
    const rawToken = await this.generateToken()
    const tokenHash = await this.hashToken(rawToken)

    const token = await this.create({
      id: uuidv4(),
      userId,
      deviceId,
      tokenHash,
      biometricType,
      biometricData: biometricData || null,
      challengeAttempts: 0,
      successCount: 0,
      isActive: true,
      expiresAt: DateTime.now().plus({ days: 30 }),
    })

    return { token, rawToken }
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      biometricType: this.biometricType,
      challengeAttempts: this.challengeAttempts,
      successCount: this.successCount,
      lastUsedAt: this.lastUsedAt?.toISO(),
      expiresAt: this.expiresAt?.toISO(),
      isActive: this.isActive,
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    }
  }
}
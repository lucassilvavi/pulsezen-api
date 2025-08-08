import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'
import UserDevice from './user_device.js'

export type AuthMethod = 'biometric' | 'devicePin' | 'appPin' | 'email' | 'sms' | 'backupCode'
export type AuthResult = 'success' | 'failed' | 'fallback' | 'blocked'

export interface GeolocationData {
  latitude?: number
  longitude?: number
  accuracy?: number
  city?: string
  country?: string
  timezone?: string
}

export interface DeviceInfo {
  model?: string
  brand?: string
  osVersion?: string
  appVersion?: string
  screenResolution?: string
  userAgent?: string
}

export default class AuthLog extends BaseModel {
  static table = 'auth_logs'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare deviceId: string | null

  @column()
  declare authMethod: AuthMethod

  @column()
  declare biometricType: string | null

  @column()
  declare result: AuthResult

  @column()
  declare failureReason: string | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column({
    serialize: (value: string) => JSON.parse(value),
    consume: (value: GeolocationData) => JSON.stringify(value),
  })
  declare geolocation: GeolocationData | null

  @column({
    serialize: (value: string) => JSON.parse(value),
    consume: (value: DeviceInfo) => JSON.stringify(value),
  })
  declare deviceInfo: DeviceInfo | null

  @column()
  declare trustScoreAtTime: number | null

  @column()
  declare responseTimeMs: number | null

  @column()
  declare requiredFallback: boolean

  @column.dateTime()
  declare attemptedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => UserDevice)
  declare device: BelongsTo<typeof UserDevice>

  // Hooks
  static async beforeCreate(authLog: AuthLog) {
    if (!authLog.id) {
      authLog.id = uuidv4()
    }
    if (!authLog.attemptedAt) {
      authLog.attemptedAt = DateTime.now()
    }
  }

  // Static factory methods
  static async logSuccessfulAuth(data: {
    userId: string
    deviceId?: string
    authMethod: AuthMethod
    biometricType?: string
    ipAddress?: string
    userAgent?: string
    geolocation?: GeolocationData
    deviceInfo?: DeviceInfo
    trustScore?: number
    responseTime?: number
  }): Promise<AuthLog> {
    return await this.create({
      id: uuidv4(),
      userId: data.userId,
      deviceId: data.deviceId || null,
      authMethod: data.authMethod,
      biometricType: data.biometricType || null,
      result: 'success',
      failureReason: null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      geolocation: data.geolocation || null,
      deviceInfo: data.deviceInfo || null,
      trustScoreAtTime: data.trustScore || null,
      responseTimeMs: data.responseTime || null,
      requiredFallback: false,
      attemptedAt: DateTime.now(),
    })
  }

  static async logFailedAuth(data: {
    userId: string
    deviceId?: string
    authMethod: AuthMethod
    biometricType?: string
    failureReason: string
    ipAddress?: string
    userAgent?: string
    geolocation?: GeolocationData
    deviceInfo?: DeviceInfo
    trustScore?: number
    responseTime?: number
  }): Promise<AuthLog> {
    return await this.create({
      id: uuidv4(),
      userId: data.userId,
      deviceId: data.deviceId || null,
      authMethod: data.authMethod,
      biometricType: data.biometricType || null,
      result: 'failed',
      failureReason: data.failureReason,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      geolocation: data.geolocation || null,
      deviceInfo: data.deviceInfo || null,
      trustScoreAtTime: data.trustScore || null,
      responseTimeMs: data.responseTime || null,
      requiredFallback: false,
      attemptedAt: DateTime.now(),
    })
  }

  static async logFallbackAuth(data: {
    userId: string
    deviceId?: string
    originalMethod: AuthMethod
    fallbackMethod: AuthMethod
    ipAddress?: string
    userAgent?: string
    geolocation?: GeolocationData
    deviceInfo?: DeviceInfo
    trustScore?: number
    responseTime?: number
  }): Promise<AuthLog> {
    return await this.create({
      id: uuidv4(),
      userId: data.userId,
      deviceId: data.deviceId || null,
      authMethod: data.fallbackMethod,
      biometricType: null,
      result: 'fallback',
      failureReason: `Fallback from ${data.originalMethod} to ${data.fallbackMethod}`,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      geolocation: data.geolocation || null,
      deviceInfo: data.deviceInfo || null,
      trustScoreAtTime: data.trustScore || null,
      responseTimeMs: data.responseTime || null,
      requiredFallback: true,
      attemptedAt: DateTime.now(),
    })
  }

  static async logBlockedAuth(data: {
    userId: string
    deviceId?: string
    authMethod: AuthMethod
    blockReason: string
    ipAddress?: string
    userAgent?: string
    trustScore?: number
  }): Promise<AuthLog> {
    return await this.create({
      id: uuidv4(),
      userId: data.userId,
      deviceId: data.deviceId || null,
      authMethod: data.authMethod,
      biometricType: null,
      result: 'blocked',
      failureReason: data.blockReason,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      geolocation: null,
      deviceInfo: null,
      trustScoreAtTime: data.trustScore || null,
      responseTimeMs: null,
      requiredFallback: false,
      attemptedAt: DateTime.now(),
    })
  }

  // Query helpers
  static async getRecentFailures(userId: string, minutes: number = 15): Promise<AuthLog[]> {
    const since = DateTime.now().minus({ minutes })
    return await this.query()
      .where('userId', userId)
      .where('result', 'failed')
      .where('attemptedAt', '>=', since.toSQL())
      .orderBy('attemptedAt', 'desc')
  }

  static async getSuccessRate(userId: string, days: number = 30): Promise<number> {
    const since = DateTime.now().minus({ days })
    
    const total = await this.query()
      .where('userId', userId)
      .where('attemptedAt', '>=', since.toSQL())
      .count('* as total')
    
    const successful = await this.query()
      .where('userId', userId)
      .where('result', 'success')
      .where('attemptedAt', '>=', since.toSQL())
      .count('* as successful')

    const totalCount = total[0]?.$extras?.total || 0
    const successCount = successful[0]?.$extras?.successful || 0

    return totalCount > 0 ? (successCount / totalCount) * 100 : 0
  }

  static async getAverageResponseTime(userId: string, authMethod: AuthMethod, days: number = 7): Promise<number> {
    const since = DateTime.now().minus({ days })
    
    const result = await this.query()
      .where('userId', userId)
      .where('authMethod', authMethod)
      .where('result', 'success')
      .where('attemptedAt', '>=', since.toSQL())
      .whereNotNull('responseTimeMs')
      .avg('responseTimeMs as avgTime')

    return result[0]?.$extras?.avgTime || 0
  }

  // Helper methods
  isSuccessful(): boolean {
    return this.result === 'success'
  }

  isFailed(): boolean {
    return this.result === 'failed'
  }

  isFallback(): boolean {
    return this.result === 'fallback'
  }

  isBlocked(): boolean {
    return this.result === 'blocked'
  }

  isSuspicious(): boolean {
    // Considera suspeito se:
    // - Multiple failed attempts
    // - Very low trust score
    // - Unusual response time
    // - Different geolocation
    return (
      this.isFailed() &&
      (this.trustScoreAtTime || 0) < 30 ||
      (this.responseTimeMs || 0) > 10000
    )
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      authMethod: this.authMethod,
      biometricType: this.biometricType,
      result: this.result,
      failureReason: this.failureReason,
      ipAddress: this.ipAddress,
      geolocation: this.geolocation,
      trustScoreAtTime: this.trustScoreAtTime,
      responseTimeMs: this.responseTimeMs,
      requiredFallback: this.requiredFallback,
      attemptedAt: this.attemptedAt.toISO(),
      createdAt: this.createdAt.toISO(),
    }
  }
}
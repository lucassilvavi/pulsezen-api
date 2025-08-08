import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import UserProfile from './user_profile.js'
import UserDevice from './user_device.js'
import BiometricToken from './biometric_token.js'
import AuthLog from './auth_log.js'
import BackupCode from './backup_code.js'

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

  // Existing relationships
  @hasOne(() => UserProfile)
  declare profile: HasOne<typeof UserProfile>

  // New biometric relationships
  @hasMany(() => UserDevice)
  declare devices: HasMany<typeof UserDevice>

  @hasMany(() => BiometricToken)
  declare biometricTokens: HasMany<typeof BiometricToken>

  @hasMany(() => AuthLog)
  declare authLogs: HasMany<typeof AuthLog>

  @hasMany(() => BackupCode)
  declare backupCodes: HasMany<typeof BackupCode>

  // Helper methods
  async getOrCreateProfile() {
    await this.load('profile')
    let profile = this.profile
    
    if (!profile) {
      profile = await UserProfile.create({
        id: uuidv4(),
        userId: this.id,
        onboardingCompleted: false
      })
    }
    
    return profile
  }

  // Biometric helper methods - simplified for now
  async getDevices() {
    await this.load('devices')
    return this.devices
  }

  async getTrustedDevices() {
    return await UserDevice.query()
      .where('userId', this.id)
      .where('isTrusted', true)
      .orderBy('lastSeenAt', 'desc')
  }

  async getDeviceByFingerprint(fingerprint: string) {
    return await UserDevice.query()
      .where('userId', this.id)
      .where('fingerprint', fingerprint)
      .first()
  }

  async hasValidBackupCodes(): Promise<boolean> {
    return await BackupCode.hasValidCodes(this.id)
  }

  async getValidBackupCodeCount(): Promise<number> {
    return await BackupCode.getValidCodeCount(this.id)
  }

  async generateNewBackupCodes(): Promise<{ codes: BackupCode[]; rawCodes: string[] }> {
    return await BackupCode.generateCodesForUser(this.id)
  }

  async getAuthSuccessRate(days: number = 30): Promise<number> {
    return await AuthLog.getSuccessRate(this.id, days)
  }

  async getRecentFailedAttempts(minutes: number = 15): Promise<AuthLog[]> {
    return await AuthLog.getRecentFailures(this.id, minutes)
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

  serializeWithBiometricInfo() {
    return {
      ...this.serialize(),
      // These will be populated separately when needed
      devicesCount: 0,
      trustedDevicesCount: 0,
      hasBackupCodes: false,
    }
  }
}
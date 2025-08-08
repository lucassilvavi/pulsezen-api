import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'
import BiometricToken from './biometric_token.js'
import DeviceTrustScore from './device_trust_score.js'

export interface DeviceCapabilities {
  hasBiometrics: boolean
  biometricTypes: string[]
  hasDevicePasscode: boolean
  hasScreenLock: boolean
  supportsKeychain: boolean
  osVersion: string
  securityPatchLevel?: string
}

export type SecurityLevel = 'premium' | 'protected' | 'basic' | 'insecure'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type Platform = 'ios' | 'android' | 'web'

export default class UserDevice extends BaseModel {
  static table = 'user_devices'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare fingerprint: string

  @column()
  declare deviceName: string

  @column()
  declare deviceType: DeviceType

  @column()
  declare platform: Platform

  @column()
  declare osVersion: string | null

  @column()
  declare appVersion: string | null

  @column({
    serialize: (value: DeviceCapabilities | string) => {
      if (typeof value === 'string') {
        return JSON.parse(value)
      }
      return value
    },
    consume: (value: DeviceCapabilities | string) => {
      if (typeof value === 'string') {
        return value
      }
      return JSON.stringify(value)
    },
  })
  declare capabilities: DeviceCapabilities

  @column()
  declare securityLevel: SecurityLevel

  @column()
  declare isTrusted: boolean

  @column()
  declare biometricEnabled: boolean

  @column.dateTime()
  declare lastSeenAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => BiometricToken)
  declare biometricTokens: HasMany<typeof BiometricToken>

  @hasOne(() => DeviceTrustScore, {
    foreignKey: 'deviceId'
  })
  declare trustScore: HasOne<typeof DeviceTrustScore>

  // Hooks
  static async beforeCreate(device: UserDevice) {
    if (!device.id) {
      device.id = uuidv4()
    }
  }

  // Helper methods
  async updateLastSeen() {
    this.lastSeenAt = DateTime.now()
    await this.save()
  }

  async calculateSecurityLevel(): Promise<SecurityLevel> {
    const { capabilities } = this

    // Premium: Biometria ativa + device seguro
    if (capabilities.hasBiometrics && capabilities.hasDevicePasscode) {
      return 'premium'
    }

    // Protected: Device com senha/PIN mas sem biometria
    if (capabilities.hasDevicePasscode && capabilities.hasScreenLock) {
      return 'protected'
    }

    // Basic: Alguma proteção mínima
    if (capabilities.hasScreenLock) {
      return 'basic'
    }

    // Insecure: Nenhuma proteção
    return 'insecure'
  }

  async updateSecurityLevel() {
    this.securityLevel = await this.calculateSecurityLevel()
    await this.save()
  }

  isHighTrust(): boolean {
    return this.isTrusted && this.securityLevel === 'premium'
  }

  canUseBiometrics(): boolean {
    return (
      this.capabilities.hasBiometrics &&
      this.biometricEnabled &&
      ['premium', 'protected'].includes(this.securityLevel)
    )
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      deviceName: this.deviceName,
      deviceType: this.deviceType,
      platform: this.platform,
      osVersion: this.osVersion,
      appVersion: this.appVersion,
      capabilities: this.capabilities,
      securityLevel: this.securityLevel,
      isTrusted: this.isTrusted,
      biometricEnabled: this.biometricEnabled,
      lastSeenAt: this.lastSeenAt?.toISO(),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    }
  }
}
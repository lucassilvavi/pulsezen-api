import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import UserDevice from './user_device.js'

export interface LocationData {
  ip: string
  country?: string
  city?: string
  timezone?: string
  isp?: string
}

export interface UsagePattern {
  dailyUsageHours: number[]
  weeklyUsageDays: number[]
  sessionDurations: number[]
  featureUsage: Record<string, number>
}

export default class DeviceTrustScore extends BaseModel {
  static table = 'device_trust_scores'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare deviceId: string

  @column()
  declare baseScore: number

  @column()
  declare behaviorScore: number

  @column()
  declare locationScore: number

  @column()
  declare timeScore: number

  @column()
  declare finalScore: number

  @column()
  declare loginFrequency: number

  @column()
  declare successfulAuths: number

  @column()
  declare failedAuths: number

  @column({
    serialize: (value: string) => JSON.parse(value),
    consume: (value: LocationData[]) => JSON.stringify(value),
  })
  declare locationHistory: LocationData[] | null

  @column({
    serialize: (value: string) => JSON.parse(value),
    consume: (value: UsagePattern) => JSON.stringify(value),
  })
  declare usagePatterns: UsagePattern | null

  @column.dateTime()
  declare lastCalculatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => UserDevice, {
    foreignKey: 'deviceId'
  })
  declare device: BelongsTo<typeof UserDevice>

  // Hooks
  static async beforeCreate(trustScore: DeviceTrustScore) {
    if (!trustScore.id) {
      trustScore.id = uuidv4()
    }
  }

  // Calculation methods
  calculateBaseScore(): number {
    // Score baseado nas capacidades do device
    const device = this.device
    if (!device) return 50

    let score = 50

    // Bonus por capacidades biométricas
    if (device.capabilities.hasBiometrics) score += 20
    if (device.capabilities.hasDevicePasscode) score += 15
    if (device.capabilities.hasScreenLock) score += 10

    // Bonus por plataforma segura
    if (device.platform === 'ios') score += 10
    if (device.platform === 'android' && device.osVersion) {
      const osVersionNum = parseInt(device.osVersion.split('.')[0])
      if (osVersionNum >= 11) score += 8
    }

    return Math.min(100, Math.max(0, score))
  }

  calculateBehaviorScore(): number {
    // Score baseado no comportamento de autenticação
    let score = 50

    const totalAuths = this.successfulAuths + this.failedAuths
    if (totalAuths > 0) {
      const successRate = this.successfulAuths / totalAuths
      score = successRate * 100
    }

    // Penalty por muitos falhas consecutivas
    if (this.failedAuths > 5) score -= 20
    if (this.failedAuths > 10) score -= 40

    // Bonus por uso consistente
    if (this.loginFrequency > 10) score += 10

    return Math.min(100, Math.max(0, score))
  }

  calculateLocationScore(): number {
    // Score baseado no histórico de localização
    let score = 50

    if (!this.locationHistory || this.locationHistory.length === 0) {
      return score
    }

    // Verifica consistência de localização
    const uniqueCountries = new Set(this.locationHistory.map(l => l.country)).size
    const uniqueIPs = new Set(this.locationHistory.map(l => l.ip)).size

    // Bonus por localização consistente
    if (uniqueCountries === 1) score += 20
    if (uniqueIPs <= 3) score += 15

    // Penalty por muita variação
    if (uniqueCountries > 3) score -= 30
    if (uniqueIPs > 10) score -= 20

    return Math.min(100, Math.max(0, score))
  }

  calculateTimeScore(): number {
    // Score baseado nos padrões de horário de uso
    let score = 50

    if (!this.usagePatterns) return score

    const { dailyUsageHours, weeklyUsageDays } = this.usagePatterns

    // Bonus por padrões consistentes
    if (dailyUsageHours.length > 0) {
      const variance = this.calculateVariance(dailyUsageHours)
      if (variance < 2) score += 20 // Uso muito consistente
      else if (variance < 4) score += 10 // Uso moderadamente consistente
    }

    if (weeklyUsageDays.length > 0) {
      const weekendUsage = weeklyUsageDays.filter(day => day === 0 || day === 6).length
      const weekdayUsage = weeklyUsageDays.filter(day => day > 0 && day < 6).length
      
      // Bonus por padrão de uso balanceado
      if (weekdayUsage > weekendUsage) score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  async calculateFinalScore(): Promise<number> {
    this.baseScore = this.calculateBaseScore()
    this.behaviorScore = this.calculateBehaviorScore()
    this.locationScore = this.calculateLocationScore()
    this.timeScore = this.calculateTimeScore()

    // Pesos para cada componente
    const weights = {
      base: 0.3,
      behavior: 0.4,
      location: 0.2,
      time: 0.1
    }

    this.finalScore = Math.round(
      this.baseScore * weights.base +
      this.behaviorScore * weights.behavior +
      this.locationScore * weights.location +
      this.timeScore * weights.time
    )

    this.lastCalculatedAt = DateTime.now()
    await this.save()

    return this.finalScore
  }

  // Update methods
  async recordSuccessfulAuth() {
    this.successfulAuths += 1
    this.loginFrequency += 1
    await this.save()
  }

  async recordFailedAuth() {
    this.failedAuths += 1
    await this.save()
  }

  async addLocationData(locationData: LocationData) {
    if (!this.locationHistory) {
      this.locationHistory = []
    }

    this.locationHistory.push(locationData)
    
    // Manter apenas os últimos 50 registros
    if (this.locationHistory.length > 50) {
      this.locationHistory = this.locationHistory.slice(-50)
    }

    await this.save()
  }

  async updateUsagePatterns(newPattern: Partial<UsagePattern>) {
    if (!this.usagePatterns) {
      this.usagePatterns = {
        dailyUsageHours: [],
        weeklyUsageDays: [],
        sessionDurations: [],
        featureUsage: {}
      }
    }

    this.usagePatterns = { ...this.usagePatterns, ...newPattern }
    await this.save()
  }

  // Trust level helpers
  getTrustLevel(): 'high' | 'medium' | 'low' | 'very_low' {
    if (this.finalScore >= 80) return 'high'
    if (this.finalScore >= 60) return 'medium'
    if (this.finalScore >= 40) return 'low'
    return 'very_low'
  }

  isTrustworthy(): boolean {
    return this.finalScore >= 70
  }

  requiresAdditionalVerification(): boolean {
    return this.finalScore < 50
  }

  // Static methods
  static async createForDevice(deviceId: string): Promise<DeviceTrustScore> {
    return await this.create({
      id: uuidv4(),
      deviceId,
      baseScore: 50,
      behaviorScore: 50,
      locationScore: 50,
      timeScore: 50,
      finalScore: 50,
      loginFrequency: 0,
      successfulAuths: 0,
      failedAuths: 0,
      locationHistory: null,
      usagePatterns: null,
    })
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      baseScore: this.baseScore,
      behaviorScore: this.behaviorScore,
      locationScore: this.locationScore,
      timeScore: this.timeScore,
      finalScore: this.finalScore,
      trustLevel: this.getTrustLevel(),
      loginFrequency: this.loginFrequency,
      successfulAuths: this.successfulAuths,
      failedAuths: this.failedAuths,
      lastCalculatedAt: this.lastCalculatedAt?.toISO(),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    }
  }
}
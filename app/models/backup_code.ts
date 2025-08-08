import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import User from './user.js'

export default class BackupCode extends BaseModel {
  static table = 'backup_codes'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare codeHash: string

  @column()
  declare codePartial: string

  @column()
  declare isUsed: boolean

  @column.dateTime()
  declare usedAt: DateTime | null

  @column()
  declare usedFromIp: string | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Hooks
  static async beforeCreate(backupCode: BackupCode) {
    if (!backupCode.id) {
      backupCode.id = uuidv4()
    }
  }

  // Static methods for code generation
  static generateRandomCode(): string {
    // Gera código alfanumérico de 8 caracteres (excluindo caracteres confusos)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  static async hashCode(code: string): Promise<string> {
    return await bcrypt.hash(code.toUpperCase(), 12)
  }

  static async verifyCode(code: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(code.toUpperCase(), hash)
  }

  static getCodePartial(code: string): string {
    // Mostra apenas os primeiros 2 e últimos 2 caracteres
    if (code.length < 4) return code
    return `${code.substring(0, 2)}****${code.substring(code.length - 2)}`
  }

  static async generateCodesForUser(userId: string, count: number = 6): Promise<{ codes: BackupCode[]; rawCodes: string[] }> {
    const codes: BackupCode[] = []
    const rawCodes: string[] = []

    // Desativar códigos existentes
    await this.query()
      .where('userId', userId)
      .where('isUsed', false)
      .update({ isUsed: true, usedAt: DateTime.now() })

    for (let i = 0; i < count; i++) {
      const rawCode = this.generateRandomCode()
      const codeHash = await this.hashCode(rawCode)
      const codePartial = this.getCodePartial(rawCode)

      const backupCode = await this.create({
        id: uuidv4(),
        userId,
        codeHash,
        codePartial,
        isUsed: false,
        expiresAt: DateTime.now().plus({ months: 6 }), // Códigos expiram em 6 meses
      })

      codes.push(backupCode)
      rawCodes.push(rawCode)
    }

    return { codes, rawCodes }
  }

  static async validateAndUseCode(userId: string, code: string, ipAddress?: string): Promise<{ valid: boolean; backupCode?: BackupCode; reason?: string }> {
    // Buscar códigos válidos do usuário
    const backupCodes = await this.query()
      .where('userId', userId)
      .where('isUsed', false)
      .whereNull('expiresAt')
      .orWhere('expiresAt', '>', DateTime.now().toSQL())

    for (const backupCode of backupCodes) {
      const isValid = await this.verifyCode(code, backupCode.codeHash)
      
      if (isValid) {
        // Marcar como usado
        backupCode.isUsed = true
        backupCode.usedAt = DateTime.now()
        backupCode.usedFromIp = ipAddress || null
        await backupCode.save()

        return { valid: true, backupCode }
      }
    }

    return { valid: false, reason: 'Invalid or expired backup code' }
  }

  static async getValidCodesForUser(userId: string): Promise<BackupCode[]> {
    return await this.query()
      .where('userId', userId)
      .where('isUsed', false)
      .where((query) => {
        query.whereNull('expiresAt')
          .orWhere('expiresAt', '>', DateTime.now().toSQL())
      })
      .orderBy('createdAt', 'desc')
  }

  static async getUsedCodesForUser(userId: string): Promise<BackupCode[]> {
    return await this.query()
      .where('userId', userId)
      .where('isUsed', true)
      .orderBy('usedAt', 'desc')
  }

  static async hasValidCodes(userId: string): Promise<boolean> {
    const count = await this.query()
      .where('userId', userId)
      .where('isUsed', false)
      .where((query) => {
        query.whereNull('expiresAt')
          .orWhere('expiresAt', '>', DateTime.now().toSQL())
      })
      .count('* as total')

    return (count[0]?.$extras?.total || 0) > 0
  }

  static async getValidCodeCount(userId: string): Promise<number> {
    const result = await this.query()
      .where('userId', userId)
      .where('isUsed', false)
      .where((query) => {
        query.whereNull('expiresAt')
          .orWhere('expiresAt', '>', DateTime.now().toSQL())
      })
      .count('* as total')

    return result[0]?.$extras?.total || 0
  }

  // Instance methods
  async markAsUsed(ipAddress?: string): Promise<void> {
    this.isUsed = true
    this.usedAt = DateTime.now()
    this.usedFromIp = ipAddress || null
    await this.save()
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false
    return this.expiresAt < DateTime.now()
  }

  isValid(): boolean {
    return !this.isUsed && !this.isExpired()
  }

  async extend(months: number = 6): Promise<void> {
    this.expiresAt = DateTime.now().plus({ months })
    await this.save()
  }

  // Serialization (segura - não expõe o código real)
  serialize() {
    return {
      id: this.id,
      codePartial: this.codePartial,
      isUsed: this.isUsed,
      usedAt: this.usedAt?.toISO(),
      expiresAt: this.expiresAt?.toISO(),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    }
  }

  serializeWithUsageInfo() {
    return {
      ...this.serialize(),
      usedFromIp: this.usedFromIp,
    }
  }
}
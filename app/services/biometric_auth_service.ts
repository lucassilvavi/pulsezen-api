import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import User from '#models/user'
import UserDevice, { type DeviceCapabilities, type SecurityLevel } from '#models/user_device'
import BiometricToken, { type BiometricType, type BiometricData } from '#models/biometric_token'
import DeviceTrustScore from '#models/device_trust_score'
import AuthLog, { type AuthMethod, type GeolocationData, type DeviceInfo } from '#models/auth_log'
import BackupCode from '#models/backup_code'

export interface DeviceRegistrationData {
  fingerprint: string
  deviceName: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  platform: 'ios' | 'android' | 'web'
  osVersion?: string
  appVersion?: string
  capabilities: DeviceCapabilities
  userAgent?: string
  ipAddress?: string
  geolocation?: GeolocationData
  deviceInfo?: DeviceInfo
}

export interface BiometricAuthData {
  userId?: string // Optional - will be identified by deviceFingerprint if not provided
  deviceFingerprint: string
  biometricType: BiometricType
  biometricSignature?: string
  challengeResponse?: string
  ipAddress?: string
  userAgent?: string
  geolocation?: GeolocationData
  deviceInfo?: DeviceInfo
}

export interface AuthResult {
  success: boolean
  method: AuthMethod
  token?: string
  fallbackMethods?: AuthMethod[]
  trustScore?: number
  requiresAdditionalVerification?: boolean
  biometricToken?: BiometricToken
  error?: string
  deviceId?: string
  user?: User
  device?: UserDevice
}

export default class BiometricAuthService {
  // Cache em memória para dispositivos (TTL: 5 minutos, MAX: 1000 dispositivos)
  private static deviceCache = new Map<string, { device: UserDevice; user: User; timestamp: number }>()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos
  private static readonly MAX_CACHE_SIZE = 1000 // Máximo de 1000 dispositivos em cache (~50MB)
  
  /**
   * Helper para truncar mensagens de erro para evitar problemas de tamanho no banco
   */
  private static truncateErrorMessage(message: string, maxLength: number = 95): string {
    if (!message || message.length <= maxLength) return message
    return message.substring(0, maxLength - 3) + '...'
  }

  /**
   * Limpa entradas expiradas do cache e aplica limite de tamanho (LRU)
   */
  private static cleanExpiredCache(): void {
    const now = Date.now()
    
    // 1. Remover expirados
    for (const [key, value] of this.deviceCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.deviceCache.delete(key)
      }
    }
    
    // 2. Se ainda exceder o limite, remover os mais antigos (LRU - Least Recently Used)
    if (this.deviceCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.deviceCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp) // Ordenar por timestamp (mais antigo primeiro)
      
      const toRemove = entries.slice(0, this.deviceCache.size - this.MAX_CACHE_SIZE)
      toRemove.forEach(([key]) => this.deviceCache.delete(key))
      
      console.log(`[CACHE] LRU cleanup: removed ${toRemove.length} oldest entries, size now: ${this.deviceCache.size}`)
    }
  }

  /**
   * Busca device do cache ou banco de dados
   */
  private static async getCachedDevice(fingerprint: string): Promise<{ device: UserDevice; user: User } | null> {
    // Limpar cache expirado periodicamente (20% de chance para manter controle)
    if (Math.random() < 0.2) { // 20% de chance a cada chamada
      this.cleanExpiredCache()
    }

    // Verificar cache
    const cached = this.deviceCache.get(fingerprint)
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log(`[CACHE HIT] Device found in cache: ${fingerprint.substring(0, 8)}... (${this.deviceCache.size}/${this.MAX_CACHE_SIZE} entries)`)
      
      // Atualizar timestamp (LRU - move to end)
      cached.timestamp = Date.now()
      
      return { device: cached.device, user: cached.user }
    }

    return null
  }

  /**
   * Salva device no cache com limite de tamanho
   */
  private static setCachedDevice(fingerprint: string, device: UserDevice, user: User): void {
    // Se atingir o limite, fazer limpeza antes de adicionar
    if (this.deviceCache.size >= this.MAX_CACHE_SIZE) {
      console.log(`[CACHE] Max size reached (${this.MAX_CACHE_SIZE}), cleaning...`)
      this.cleanExpiredCache()
    }
    
    this.deviceCache.set(fingerprint, {
      device,
      user,
      timestamp: Date.now()
    })
    console.log(`[CACHE SET] Device cached: ${fingerprint.substring(0, 8)}... (${this.deviceCache.size}/${this.MAX_CACHE_SIZE} entries)`)
  }

  /**
   * Retorna estatísticas do cache (útil para monitoramento)
   */
  static getCacheStats() {
    const now = Date.now()
    let expired = 0
    
    for (const [, value] of this.deviceCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        expired++
      }
    }
    
    return {
      size: this.deviceCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      utilization: ((this.deviceCache.size / this.MAX_CACHE_SIZE) * 100).toFixed(2) + '%',
      expired,
      active: this.deviceCache.size - expired,
      ttlMinutes: this.CACHE_TTL / 60000
    }
  }
  /**
   * Registra um novo dispositivo para o usuário
   */
  static async registerDevice(userId: string, deviceData: DeviceRegistrationData): Promise<UserDevice> {
    // Verificar se device já existe
    let device = await UserDevice.query()
      .where('userId', userId)
      .where('fingerprint', deviceData.fingerprint)
      .first()

    if (device) {
      // Atualizar device existente
      device.deviceName = deviceData.deviceName
      device.osVersion = deviceData.osVersion || null
      device.appVersion = deviceData.appVersion || null
      device.capabilities = deviceData.capabilities
      device.lastSeenAt = DateTime.now()
      await device.save()
      
      // Recalcular security level
      device.securityLevel = await this.calculateSecurityLevel(deviceData.capabilities)
      await device.save()
      
      return device
    }

    // Calcular security level inicial
    const securityLevel = await this.calculateSecurityLevel(deviceData.capabilities)

    // Criar novo device
    device = await UserDevice.create({
      id: uuidv4(),
      userId,
      fingerprint: deviceData.fingerprint,
      deviceName: deviceData.deviceName,
      deviceType: deviceData.deviceType,
      platform: deviceData.platform,
      osVersion: deviceData.osVersion || null,
      appVersion: deviceData.appVersion || null,
      capabilities: deviceData.capabilities,
      securityLevel,
      isTrusted: false,
      biometricEnabled: false,
      lastSeenAt: DateTime.now(),
    })

    // Criar trust score inicial
    await DeviceTrustScore.create({
      id: uuidv4(),
      deviceId: device.id,
      baseScore: 50,
      behaviorScore: 50,
      locationScore: 50,
      timeScore: 50,
      finalScore: 50,
      loginFrequency: 0,
      successfulAuths: 0,
      failedAuths: 0,
    })

    // Log do registro
    await AuthLog.create({
      id: uuidv4(),
      userId,
      deviceId: device.id,
      authMethod: 'email', // Registro inicial via email
      result: 'success',
      ipAddress: deviceData.ipAddress || null,
      userAgent: deviceData.userAgent || null,
      geolocation: deviceData.geolocation || null,
      deviceInfo: deviceData.deviceInfo || null,
      attemptedAt: DateTime.now(),
    })

    return device
  }

  /**
   * Calcula o nível de segurança do dispositivo
   */
  static async calculateSecurityLevel(capabilities: DeviceCapabilities): Promise<SecurityLevel> {
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

  /**
   * Habilita autenticação biométrica para um dispositivo
   */
  static async enableBiometricAuth(
    userId: string,
    deviceFingerprint: string,
    biometricType: BiometricType,
    biometricData?: BiometricData
  ): Promise<{ success: boolean; biometricToken?: BiometricToken; error?: string }> {
    // Buscar device
    const device = await UserDevice.query()
      .where('userId', userId)
      .where('fingerprint', deviceFingerprint)
      .first()

    if (!device) {
      return { success: false, error: 'Device not found' }
    }

    // Verificar se device suporta biometria
    // Force parse if string
    let capabilities = device.capabilities
    if (typeof capabilities === 'string') {
      capabilities = JSON.parse(capabilities)
    }
    
    if (!capabilities.hasBiometrics) {
      return { success: false, error: 'Device does not support biometrics' }
    }

    // Criar token biométrico
    const { token: biometricToken } = await BiometricToken.createForDevice(
      userId,
      device.id,
      biometricType,
      biometricData
    )

    // Habilitar biometria no device
    device.biometricEnabled = true
    await device.save()

    // Log da habilitação
    await AuthLog.create({
      id: uuidv4(),
      userId,
      deviceId: device.id,
      authMethod: 'biometric',
      biometricType,
      result: 'success',
      attemptedAt: DateTime.now(),
    })

    return { success: true, biometricToken }
  }

  /**
   * Autentica usuário com biometria
   */
  static async authenticateWithBiometric(authData: BiometricAuthData): Promise<AuthResult> {
    const startTime = Date.now()
    const perfLog = (step: string, stepStartTime: number) => {
      console.log(`[PERF] ${step}: ${Date.now() - stepStartTime}ms`)
    }

    try {
      let user: User | null = null
      let device: UserDevice | null = null

      // Tentar buscar do cache primeiro
      const t0 = Date.now()
      const cachedData = await this.getCachedDevice(authData.deviceFingerprint)
      if (cachedData) {
        device = cachedData.device
        user = cachedData.user
        perfLog('Device & User from CACHE', t0)
      } else if (authData.userId) {
        // Se userId foi fornecido, buscar diretamente
        const t1 = Date.now()
        user = await User.find(authData.userId)
        perfLog('User.find', t1)
        
        if (!user) {
          return { success: false, method: 'biometric', error: 'User not found' }
        }

        // Buscar device
        const t2 = Date.now()
        device = await UserDevice.query()
          .where('userId', authData.userId)
          .where('fingerprint', authData.deviceFingerprint)
          .preload('trustScore')
          .first()
        perfLog('Device query with trustScore', t2)
        
        // Cachear se encontrado
        if (device) {
          this.setCachedDevice(authData.deviceFingerprint, device, user)
        }
      } else {
        // Identificar usuário pelo deviceFingerprint
        const t1 = Date.now()
        device = await UserDevice.query()
          .where('fingerprint', authData.deviceFingerprint)
          .where('biometricEnabled', true) // Otimização: filtrar apenas habilitados
          .preload('trustScore')
          .first()
        perfLog('Device query by fingerprint', t1)

        if (device) {
          const t2 = Date.now()
          user = await User.find(device.userId)
          perfLog('User.find from device', t2)
          
          // Cachear para próximas autenticações
          if (user) {
            this.setCachedDevice(authData.deviceFingerprint, device, user)
          }
        }
      }

      if (!device || !user) {
        // Só fazer log se conseguimos identificar pelo menos o device
        if (device) {
          await this.logFailedAuth(
            { ...authData, userId: device.userId },
            'Device found but user not found'
          )
        }
        return { success: false, method: 'biometric', error: 'Device not registered' }
      }

      // Verificar se biometria está habilitada
      if (!device.biometricEnabled) {
        await this.logFailedAuth(authData, 'Biometric not enabled', device.id)
        return {
          success: false,
          method: 'biometric',
          error: 'Biometric authentication not enabled',
          fallbackMethods: await this.getFallbackMethods(device),
          deviceId: device.id,
        }
      }

      // Buscar token biométrico válido
      const t3 = Date.now()
      const biometricToken = await BiometricToken.query()
        .where('userId', user.id)
        .where('deviceId', device.id)
        .where('biometricType', authData.biometricType)
        .where('isActive', true)
        .where((query) => {
          query.whereNull('expiresAt').orWhere('expiresAt', '>', DateTime.now().toSQL())
        })
        .first()
      perfLog('BiometricToken query', t3)

      if (!biometricToken) {
        await this.logFailedAuth(authData, 'No valid biometric token', device.id)
        return {
          success: false,
          method: 'biometric',
          error: 'No valid biometric token found',
          fallbackMethods: await this.getFallbackMethods(device),
          deviceId: device.id,
        }
      }

      // Verificar trust score
      const trustScore = device.trustScore
      if (!trustScore || trustScore.finalScore < 30) {
        await this.logFailedAuth(authData, 'Low trust score', device.id)
        return {
          success: false,
          method: 'biometric',
          error: 'Device trust score too low',
          requiresAdditionalVerification: true,
          trustScore: trustScore?.finalScore || 0,
          deviceId: device.id,
        }
      }

      // Validar assinatura biométrica (se fornecida)
      if (authData.biometricSignature) {
        const t4 = Date.now()
        const isValidSignature = await this.validateBiometricSignature(
          biometricToken,
          authData.biometricSignature
        )
        perfLog('Signature validation', t4)

        if (!isValidSignature) {
          await biometricToken.recordAttempt()
          await this.logFailedAuth(authData, 'Invalid biometric signature', device.id)
          return {
            success: false,
            method: 'biometric',
            error: 'Invalid biometric signature',
            fallbackMethods: await this.getFallbackMethods(device),
            deviceId: device.id,
          }
        }
      }

      // Autenticação bem-sucedida!
      const responseTime = Date.now() - startTime

      // Atualizar estatísticas em paralelo
      const t5 = Date.now()
      device.lastSeenAt = DateTime.now()
      
      // Executar todas as atualizações em paralelo
      const [, , , accessToken] = await Promise.all([
        biometricToken.recordUsage(),
        trustScore.recordSuccessfulAuth(),
        device.save(),
        this.generateAccessToken(user.id, device.id),
        AuthLog.logSuccessfulAuth({
          userId: user.id,
          deviceId: device.id,
          authMethod: 'biometric',
          biometricType: authData.biometricType,
          ipAddress: authData.ipAddress,
          userAgent: authData.userAgent,
          geolocation: authData.geolocation,
          deviceInfo: authData.deviceInfo,
          trustScore: trustScore.finalScore,
          responseTime,
        })
      ])
      perfLog('Parallel updates (token.recordUsage, trustScore, device.save, generateToken, log)', t5)
      
      console.log(`[PERF] Total authenticateWithBiometric: ${Date.now() - startTime}ms`)

      // Preload profile para evitar query adicional no controller
      await user.load('profile')

      return {
        success: true,
        method: 'biometric',
        token: accessToken as string,
        trustScore: trustScore.finalScore,
        biometricToken,
        deviceId: device.id,
        user,
        device,
      }
    } catch (error) {
      console.error('Biometric authentication error:', error)
      
      // Só fazer log se conseguimos identificar o usuário
      if (authData.userId) {
        await this.logFailedAuth(authData, `Internal error: ${error.message}`)
      }
      
      return {
        success: false,
        method: 'biometric',
        error: 'Authentication failed due to internal error',
      }
    }
  }

  /**
   * Retorna métodos de fallback disponíveis para um device
   */
  static async getFallbackMethods(device: UserDevice): Promise<AuthMethod[]> {
    const methods: AuthMethod[] = []

    // Device PIN se disponível
    if (device.capabilities.hasDevicePasscode) {
      methods.push('devicePin')
    }

    // PIN customizado sempre disponível
    methods.push('appPin')

    // Email sempre disponível
    methods.push('email')

    // SMS se configurado
    // methods.push('sms')

    return methods
  }

  /**
   * Valida assinatura biométrica
   */
  static async validateBiometricSignature(
    biometricToken: BiometricToken,
    signature: string
  ): Promise<boolean> {
    try {
      console.log('🔍 Starting signature validation...')
      console.log(`  Token ID: ${biometricToken.id}`)
      console.log(`  Device ID: ${biometricToken.deviceId}`)
      console.log(`  Biometric Type: ${biometricToken.biometricType}`)
      console.log(`  Biometric Data:`, biometricToken.biometricData)

      // Verificar se temos dados biométricos
      if (!biometricToken.biometricData) {
        console.log('❌ Validation failed: No biometric data')
        return false
      }

      // Forçar parsing se for string
      let biometricData = biometricToken.biometricData
      if (typeof biometricData === 'string') {
        console.log('🔄 Parsing biometric data from string...')
        try {
          biometricData = JSON.parse(biometricData)
        } catch (parseError) {
          console.log('❌ Validation failed: Invalid JSON in biometric data')
          return false
        }
      }

      console.log(`  Parsed Biometric Data:`, biometricData)
      
      if (!biometricData.publicKey) {
        console.log('❌ Validation failed: No public key found')
        return false
      }

      // Validação simplificada usando deviceId + publicKey (determinístico)
      const expectedSignature = crypto
        .createHash('sha256')
        .update(biometricToken.deviceId + biometricData.publicKey + biometricToken.biometricType)
        .digest('hex')

      console.log('🔍 Signature validation debug:')
      console.log(`  Device ID: ${biometricToken.deviceId}`)
      console.log(`  Public Key: ${biometricData.publicKey}`)
      console.log(`  Biometric Type: ${biometricToken.biometricType}`)
      console.log(`  Expected signature: ${expectedSignature}`)
      console.log(`  Received signature: ${signature}`)
      console.log(`  Match: ${signature === expectedSignature}`)

      return signature === expectedSignature
    } catch (error) {
      console.error('❌ Signature validation error:', error)
      return false
    }
  }

  /**
   * Gera token de acesso usando JWT padrão (mesmo formato do login normal)
   */
  static async generateAccessToken(userId: string, deviceId: string): Promise<string> {
    // Buscar o usuário para obter o email
    const user = await User.find(userId)
    if (!user) {
      throw new Error('User not found for token generation')
    }

    // Usar o mesmo padrão do AuthService
    const payload = {
      userId,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      deviceId // Adicionar deviceId para contexto biométrico
    }

    const expiresIn = env.get('JWT_EXPIRES_IN') || '15m'
    const secret = env.get('JWT_SECRET')
    
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
  }

  /**
   * Autentica com código de backup
   */
  static async authenticateWithBackupCode(
    userId: string,
    code: string,
    ipAddress?: string
  ): Promise<AuthResult> {
    const result = await BackupCode.validateAndUseCode(userId, code, ipAddress)

    if (result.valid && result.backupCode) {
      // Log de sucesso
      await AuthLog.logSuccessfulAuth({
        userId,
        authMethod: 'backupCode',
        ipAddress,
      })

      // Gerar token de acesso
      const accessToken = await this.generateAccessToken(userId, 'backup')

      return {
        success: true,
        method: 'backupCode',
        token: accessToken,
      }
    }

    // Log de falha
    await AuthLog.logFailedAuth({
      userId,
      authMethod: 'backupCode',
      failureReason: this.truncateErrorMessage(result.reason || 'Invalid backup code'),
      ipAddress,
    })

    return {
      success: false,
      method: 'backupCode',
      error: result.reason || 'Invalid backup code',
    }
  }

  /**
   * Obtém estatísticas de autenticação do usuário
   */
  static async getUserAuthStats(userId: string) {
    const user = await User.find(userId)
    if (!user) return null

    const devices = await UserDevice.query()
      .where('userId', userId)
      .preload('trustScore')
      .orderBy('lastSeenAt', 'desc')

    const totalDevices = devices.length
    const trustedDevices = devices.filter((d) => d.isTrusted).length
    const biometricEnabledDevices = devices.filter((d) => d.biometricEnabled).length

    const authSuccessRate = await AuthLog.getSuccessRate(userId, 30)
    const recentFailures = await AuthLog.getRecentFailures(userId, 60)

    const hasBackupCodes = await BackupCode.hasValidCodes(userId)
    const backupCodesCount = await BackupCode.getValidCodeCount(userId)

    return {
      userId,
      email: user.email,
      totalDevices,
      trustedDevices,
      biometricEnabledDevices,
      authSuccessRate,
      recentFailuresCount: recentFailures.length,
      hasBackupCodes,
      backupCodesCount,
      devices: devices.map((device) => ({
        id: device.id,
        name: device.deviceName,
        type: device.deviceType,
        platform: device.platform,
        securityLevel: device.securityLevel,
        isTrusted: device.isTrusted,
        biometricEnabled: device.biometricEnabled,
        trustScore: device.trustScore?.finalScore || 0,
        lastSeen: device.lastSeenAt?.toISO(),
      })),
    }
  }

  /**
   * Revoga um dispositivo (remove acesso biométrico)
   */
  static async revokeDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      // Desativar tokens biométricos
      await BiometricToken.query()
        .where('userId', userId)
        .where('deviceId', deviceId)
        .update({ isActive: false })

      // Marcar device como não confiável
      const device = await UserDevice.find(deviceId)
      if (device && device.userId === userId) {
        device.isTrusted = false
        device.biometricEnabled = false
        await device.save()

        // Log da revogação
        await AuthLog.create({
          id: uuidv4(),
          userId,
          deviceId,
          authMethod: 'email', // Revogação via dashboard
          result: 'success',
          attemptedAt: DateTime.now(),
        })

        return true
      }

      return false
    } catch (error) {
      console.error('Device revocation error:', error)
      return false
    }
  }

  /**
   * Helper para log de autenticação falha
   */
  private static async logFailedAuth(authData: BiometricAuthData, reason: string, deviceId?: string) {
    // Só fazer log se temos userId
    if (!authData.userId) {
      console.log(`Warning: Cannot log failed auth without userId. Reason: ${reason}`)
      return
    }

    await AuthLog.logFailedAuth({
      userId: authData.userId,
      deviceId,
      authMethod: 'biometric',
      biometricType: authData.biometricType,
      failureReason: this.truncateErrorMessage(reason),
      ipAddress: authData.ipAddress,
      userAgent: authData.userAgent,
      geolocation: authData.geolocation,
      deviceInfo: authData.deviceInfo,
    })
  }

  /**
   * Busca todos os dispositivos de um usuário
   */
  static async getUserDevices(userId: string) {
    const devices = await UserDevice.query()
      .where('userId', userId)
      .preload('trustScore')
      .orderBy('lastSeenAt', 'desc')

    return devices.map(device => ({
      id: device.id,
      fingerprint: device.fingerprint,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      platform: device.platform,
      osVersion: device.osVersion,
      appVersion: device.appVersion,
      securityLevel: device.securityLevel,
      isTrusted: device.isTrusted,
      biometricEnabled: device.biometricEnabled,
      trustScore: device.trustScore?.finalScore || 0,
      lastSeenAt: device.lastSeenAt,
      createdAt: device.createdAt,
    }))
  }
}
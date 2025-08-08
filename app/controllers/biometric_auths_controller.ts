import type { HttpContext } from '@adonisjs/core/http'
import BiometricAuthService from '#services/biometric_auth_service'
import BackupCode from '#models/backup_code'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

@inject()
export default class BiometricAuthsController {
  /**
   * Registra um novo dispositivo para o usuário autenticado
   * POST /api/auth/device/register
   */
  async registerDevice({ request, response, auth }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.unauthorized({ error: 'User not authenticated' })
      }
      
      const {
        fingerprint,
        deviceName,
        deviceType,
        platform,
        osVersion,
        appVersion,
        capabilities,
      } = request.only([
        'fingerprint',
        'deviceName', 
        'deviceType',
        'platform',
        'osVersion',
        'appVersion',
        'capabilities',
      ])

      // Validação básica
      if (!fingerprint || !deviceName || !deviceType || !platform || !capabilities) {
        return response.badRequest({
          error: 'Missing required fields',
          required: ['fingerprint', 'deviceName', 'deviceType', 'platform', 'capabilities'],
        })
      }

      // Dados do contexto da requisição
      const deviceData = {
        fingerprint,
        deviceName,
        deviceType,
        platform,
        osVersion,
        appVersion,
        capabilities,
        userAgent: request.header('user-agent'),
        ipAddress: request.ip(),
        geolocation: request.input('geolocation'),
        deviceInfo: {
          userAgent: request.header('user-agent'),
          ...request.input('deviceInfo', {}),
        },
      }

      const device = await BiometricAuthService.registerDevice(auth.userId, deviceData)

      return response.created({
        success: true,
        data: {
          device: device.serialize(),
          securityLevel: device.securityLevel,
          canUseBiometrics: device.canUseBiometrics(),
          trustScore: 50, // Initial score
        },
      })
    } catch (error) {
      console.error('Device registration error:', error)
      return response.internalServerError({
        error: 'Failed to register device',
        message: error.message,
      })
    }
  }

  /**
   * Habilita autenticação biométrica para um dispositivo
   * POST /api/auth/biometric/enable
   */
  async enableBiometric({ request, response, auth }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.unauthorized({ error: 'User not authenticated' })
      }
      
      const {
        deviceFingerprint,
        biometricType,
        biometricData,
      } = request.only([
        'deviceFingerprint',
        'biometricType',
        'biometricData',
      ])

      if (!deviceFingerprint || !biometricType) {
        return response.badRequest({
          error: 'Missing required fields',
          required: ['deviceFingerprint', 'biometricType'],
        })
      }

      const result = await BiometricAuthService.enableBiometricAuth(
        auth.userId,
        deviceFingerprint,
        biometricType,
        biometricData
      )

      if (result.success) {
        return response.ok({
          success: true,
          data: {
            biometricEnabled: true,
            biometricType,
            token: result.biometricToken?.serialize(),
          },
        })
      }

      return response.badRequest({
        success: false,
        error: result.error,
      })
    } catch (error) {
      console.error('Biometric enable error:', error)
      return response.internalServerError({
        error: 'Failed to enable biometric authentication',
        message: error.message,
      })
    }
  }

  /**
   * Autentica usuário com biometria
   * POST /api/auth/biometric/login
   */
  async biometricLogin({ request, response }: HttpContext) {
    try {
      const {
        userId,
        deviceFingerprint,
        biometricType,
        biometricSignature,
        challengeResponse,
      } = request.only([
        'userId',
        'deviceFingerprint',
        'biometricType',
        'biometricSignature',
        'challengeResponse',
      ])

      if (!deviceFingerprint || !biometricType) {
        return response.badRequest({
          error: 'Missing required fields',
          required: ['deviceFingerprint', 'biometricType'],
        })
      }

      const authData = {
        userId, // Optional - will be identified by deviceFingerprint if not provided
        deviceFingerprint,
        biometricType,
        biometricSignature,
        challengeResponse,
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
        geolocation: request.input('geolocation'),
        deviceInfo: {
          userAgent: request.header('user-agent'),
          ...request.input('deviceInfo', {}),
        },
      }

      const result = await BiometricAuthService.authenticateWithBiometric(authData)

      if (result.success) {
        return response.ok({
          success: true,
          data: {
            token: result.token,
            method: result.method,
            trustScore: result.trustScore,
            deviceId: result.deviceId,
            expiresAt: DateTime.now().plus({ hours: 24 }).toISO(),
          },
        })
      }

      // Retornar métodos de fallback se disponíveis
      const errorResponse: any = {
        success: false,
        error: result.error,
        method: result.method,
      }

      if (result.fallbackMethods && result.fallbackMethods.length > 0) {
        errorResponse.fallbackMethods = result.fallbackMethods
      }

      if (result.requiresAdditionalVerification) {
        errorResponse.requiresAdditionalVerification = true
        errorResponse.trustScore = result.trustScore
      }

      if (result.deviceId) {
        errorResponse.deviceId = result.deviceId
      }

      return response.unauthorized(errorResponse)
    } catch (error) {
      console.error('Biometric login error:', error)
      return response.internalServerError({
        error: 'Authentication failed',
        message: error.message,
      })
    }
  }

  /**
   * Autentica com código de backup
   * POST /api/auth/backup-code/login
   */
  async backupCodeLogin({ request, response }: HttpContext) {
    try {
      const { userId, code } = request.only(['userId', 'code'])

      if (!userId || !code) {
        return response.badRequest({
          error: 'Missing required fields',
          required: ['userId', 'code'],
        })
      }

      const result = await BiometricAuthService.authenticateWithBackupCode(
        userId,
        code,
        request.ip()
      )

      if (result.success) {
        return response.ok({
          success: true,
          data: {
            token: result.token,
            method: result.method,
            expiresAt: DateTime.now().plus({ hours: 24 }).toISO(),
          },
        })
      }

      return response.unauthorized({
        success: false,
        error: result.error,
        method: result.method,
      })
    } catch (error) {
      console.error('Backup code login error:', error)
      return response.internalServerError({
        error: 'Authentication failed',
        message: error.message,
      })
    }
  }

  /**
   * Obtém estatísticas de autenticação do usuário
   * GET /api/auth/stats
   */
  async getAuthStats({ response, auth }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.unauthorized({ error: 'User not authenticated' })
      }

      const stats = await BiometricAuthService.getUserAuthStats(auth.userId)

      if (!stats) {
        return response.notFound({
          error: 'User not found',
        })
      }

      return response.ok({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Auth stats error:', error)
      return response.internalServerError({
        error: 'Failed to get authentication statistics',
        message: error.message,
      })
    }
  }

  /**
   * Revoga um dispositivo
   * DELETE /api/auth/device/:deviceId
   */
  async revokeDevice({ params, response, auth }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.unauthorized({ error: 'User not authenticated' })
      }
      const { deviceId } = params

      if (!deviceId) {
        return response.badRequest({
          error: 'Device ID is required',
        })
      }

      const revoked = await BiometricAuthService.revokeDevice(auth.userId, deviceId)

      if (revoked) {
        return response.ok({
          success: true,
          message: 'Device revoked successfully',
        })
      }

      return response.notFound({
        success: false,
        error: 'Device not found or access denied',
      })
    } catch (error) {
      console.error('Device revocation error:', error)
      return response.internalServerError({
        error: 'Failed to revoke device',
        message: error.message,
      })
    }
  }

  /**
   * Gera novos códigos de backup
   * POST /api/auth/backup-codes/generate
   */
  async generateBackupCodes({ response, auth }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.unauthorized({ error: 'User not authenticated' })
      }

      const { codes, rawCodes } = await BackupCode.generateCodesForUser(auth.userId, 10)

      return response.ok({
        success: true,
        data: {
          codes: codes.map(code => code.serialize()),
          rawCodes, // Mostrar apenas uma vez
          message: 'Save these backup codes in a secure location. They will not be shown again.',
        },
      })
    } catch (error) {
      console.error('Backup codes generation error:', error)
      return response.internalServerError({
        error: 'Failed to generate backup codes',
        message: error.message,
      })
    }
  }

  /**
   * Lista códigos de backup válidos (sem mostrar o código real)
   * GET /api/auth/backup-codes
   */
  async getBackupCodes({ response, auth }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.unauthorized({ error: 'User not authenticated' })
      }

      const validCodes = await BackupCode.getValidCodesForUser(auth.userId)
      const usedCodes = await BackupCode.getUsedCodesForUser(auth.userId)

      return response.ok({
        success: true,
        data: {
          validCodes: validCodes.map(code => code.serialize()),
          usedCodes: usedCodes.map(code => code.serializeWithUsageInfo()),
          totalValid: validCodes.length,
          totalUsed: usedCodes.length,
        },
      })
    } catch (error) {
      console.error('Backup codes list error:', error)
      return response.internalServerError({
        error: 'Failed to get backup codes',
        message: error.message,
      })
    }
  }

  /**
   * Verifica capacidades do dispositivo
   * POST /api/auth/device/capabilities
   */
  async checkDeviceCapabilities({ request, response }: HttpContext) {
    try {
      const { capabilities } = request.only(['capabilities'])

      if (!capabilities) {
        return response.badRequest({
          error: 'Device capabilities are required',
        })
      }

      const securityLevel = await BiometricAuthService.calculateSecurityLevel(capabilities)
      const fallbackMethods = await BiometricAuthService.getFallbackMethods({
        capabilities,
      } as any)

      return response.ok({
        success: true,
        data: {
          securityLevel,
          canUseBiometrics: capabilities.hasBiometrics,
          hasDevicePasscode: capabilities.hasDevicePasscode,
          hasScreenLock: capabilities.hasScreenLock,
          fallbackMethods,
          recommendations: this.getSecurityRecommendations(securityLevel, capabilities),
        },
      })
    } catch (error) {
      console.error('Device capabilities check error:', error)
      return response.internalServerError({
        error: 'Failed to check device capabilities',
        message: error.message,
      })
    }
  }

  /**
   * Helper para recomendações de segurança
   */
  private getSecurityRecommendations(securityLevel: string, capabilities: any) {
    const recommendations = []

    if (securityLevel === 'insecure') {
      recommendations.push('Enable screen lock on your device for better security')
      recommendations.push('Consider using a device PIN or password')
    }

    if (securityLevel === 'basic') {
      if (capabilities.hasBiometrics) {
        recommendations.push('Enable biometric authentication for faster and more secure login')
      }
      recommendations.push('Enable device passcode for additional security')
    }

    if (securityLevel === 'protected') {
      if (capabilities.hasBiometrics) {
        recommendations.push('Enable biometric authentication for premium security experience')
      }
    }

    if (securityLevel === 'premium') {
      recommendations.push('Your device has optimal security configuration')
    }

    return recommendations
  }

  /**
   * Lista todos os dispositivos do usuário autenticado
   * GET /api/auth/devices
   */
  async getDevices({ response, auth }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.unauthorized({ error: 'User not authenticated' })
      }

      const devices = await BiometricAuthService.getUserDevices(auth.userId)

      return response.ok({
        success: true,
        data: {
          devices,
          totalDevices: devices.length,
          trustedDevices: devices.filter(device => device.isTrusted).length,
          biometricEnabledDevices: devices.filter(device => device.biometricEnabled).length,
        },
      })
    } catch (error) {
      console.error('Get devices error:', error)
      return response.internalServerError({
        error: 'Failed to retrieve devices',
        message: 'Unable to fetch devices for user',
      })
    }
  }
}
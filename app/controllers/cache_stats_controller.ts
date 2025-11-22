import type { HttpContext } from '@adonisjs/core/http'
import BiometricAuthService from '#services/biometric_auth_service'

export default class CacheStatsController {
  /**
   * Retorna estatísticas do cache de dispositivos biométricos
   * GET /api/v1/admin/cache/stats
   */
  async stats({ response }: HttpContext) {
    const stats = BiometricAuthService.getCacheStats()
    
    return response.ok({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  }
}

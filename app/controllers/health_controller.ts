import type { HttpContext } from '@adonisjs/core/http'

export default class HealthController {
  /**
   * Health check endpoint
   */
  async check({ response }: HttpContext) {
    try {
      // Check database connection
      // TODO: Implement actual database check
      // await db.raw('SELECT 1')
      
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected', // Will be actual check in production
          memory: process.memoryUsage(),
          uptime: process.uptime(),
          version: '1.0.0'
        },
        environment: process.env.NODE_ENV || 'development'
      }

      return response.json(healthData)
    } catch (error) {
      return response.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
        message: 'Health check failed'
      })
    }
  }

  /**
   * Detailed system info (for development)
   */
  async info({ response }: HttpContext) {
    try {
      const systemInfo = {
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch
        },
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }

      return response.json({
        success: true,
        data: systemInfo
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Failed to retrieve system info'
      })
    }
  }
}

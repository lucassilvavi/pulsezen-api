import type { HttpContext } from '@adonisjs/core/http'
import { StructuredLogger } from '#services/structured_logger'
import env from '#start/env'

export default class SimpleTestController {
  /**
   * GET /debug/smtp
   * Simple SMTP configuration check
   */
  async checkSmtp({ response }: HttpContext) {
    try {
      const smtpConfig = {
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT'),
        username: env.get('SMTP_USERNAME'),
        passwordSet: !!env.get('SMTP_PASSWORD'),
        passwordLength: env.get('SMTP_PASSWORD')?.length || 0,
        passwordHasSpaces: env.get('SMTP_PASSWORD')?.includes(' ') || false,
      }

      StructuredLogger.info('SMTP configuration debug check', smtpConfig)

      return response.status(200).json({
        success: true,
        message: 'SMTP configuration checked',
        config: smtpConfig,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      StructuredLogger.error('Error checking SMTP config', error)

      return response.status(500).json({
        success: false,
        error: 'Config check failed',
        message: error.message
      })
    }
  }

  /**
   * GET /debug/env
   * Environment variables check
   */
  async checkEnv({ response }: HttpContext) {
    try {
      const envCheck = {
        nodeEnv: env.get('NODE_ENV'),
        appKey: env.get('APP_KEY') ? 'SET' : 'NOT_SET',
        jwtSecret: env.get('JWT_SECRET') ? 'SET' : 'NOT_SET',
        databaseUrl: env.get('DATABASE_URL') ? 'SET' : 'NOT_SET',
        smtpHost: env.get('SMTP_HOST') || 'NOT_SET',
        smtpPort: env.get('SMTP_PORT') || 'NOT_SET',
        smtpUsername: env.get('SMTP_USERNAME') || 'NOT_SET',
        smtpPassword: env.get('SMTP_PASSWORD') ? 'SET' : 'NOT_SET',
      }

      StructuredLogger.info('Environment variables check', envCheck)

      return response.status(200).json({
        success: true,
        message: 'Environment checked',
        env: envCheck,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      StructuredLogger.error('Error checking environment', error)

      return response.status(500).json({
        success: false,
        error: 'Environment check failed',
        message: error.message
      })
    }
  }

  /**
   * POST /debug/test-password-reset
   * Test the password reset flow
   */
  async testPasswordReset({ request, response }: HttpContext) {
    try {
      const { email } = request.only(['email'])
      
      if (!email) {
        return response.status(400).json({
          success: false,
          error: 'Missing email',
          message: 'Email é obrigatório para o teste'
        })
      }

      StructuredLogger.info('Testing password reset flow', { email })

      // Import the service here to avoid circular dependencies
      const PasswordResetService = (await import('#services/password_reset_service')).default
      
      const result = await PasswordResetService.requestPasswordReset(email)

      return response.status(200).json({
        success: true,
        message: 'Password reset test completed',
        result,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      StructuredLogger.error('Error testing password reset', error)

      return response.status(500).json({
        success: false,
        error: 'Password reset test failed',
        message: error.message,
        stack: error.stack
      })
    }
  }
}
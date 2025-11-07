import { HttpContext } from '@adonisjs/core/http'
import { HybridEmailService } from '#services/hybrid_email_service'
import env from '#start/env'

export default class ResendTestController {
  /**
   * Test Resend API directly
   */
  async testResendApi({ response }: HttpContext) {
    try {
      console.log('🧪 Testing Resend API directly...')
      
      const result = await HybridEmailService.send({
        to: 'lucas.vieira789lv@gmail.com',
        from: 'PulseZen <noreply@resend.dev>',
        subject: '🧪 Resend API Test',
        html: `
          <h2>🧪 Resend API Test Success!</h2>
          <p>Este email foi enviado usando Resend API em produção.</p>
          <p>Environment: ${env.get('NODE_ENV')}</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Service: Resend API</p>
        `
      })

      console.log('✅ Resend API test successful:', result)

      return response.json({
        success: true,
        message: 'Resend API test completed successfully',
        service: 'resend',
        environment: env.get('NODE_ENV'),
        result: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Resend API test failed:', error)
      
      return response.status(500).json({
        success: false,
        message: 'Resend API test failed',
        service: 'resend',
        environment: env.get('NODE_ENV'),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5)
        },
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Test hybrid email service (auto-selects based on environment)
   */
  async testHybridService({ response }: HttpContext) {
    try {
      console.log('🔄 Testing Hybrid Email Service...')
      
      const result = await HybridEmailService.sendPasswordReset(
        'lucas.vieira789lv@gmail.com',
        '123456',
        'Lucas'
      )

      console.log('✅ Hybrid service test successful:', result)

      return response.json({
        success: true,
        message: 'Hybrid email service test completed successfully',
        environment: env.get('NODE_ENV'),
        hasResendKey: !!env.get('RESEND_API_KEY'),
        result: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Hybrid service test failed:', error)
      
      return response.status(500).json({
        success: false,
        message: 'Hybrid email service test failed',
        environment: env.get('NODE_ENV'),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5)
        },
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Check which email service will be used
   */
  async checkEmailService({ response }: HttpContext) {
    const nodeEnv = env.get('NODE_ENV')
    const hasResendKey = !!env.get('RESEND_API_KEY')
    const hasSmtpConfig = !!(env.get('SMTP_HOST') && env.get('SMTP_USERNAME') && env.get('SMTP_PASSWORD'))
    
    const willUseResend = nodeEnv === 'production' && hasResendKey
    
    return response.json({
      success: true,
      message: 'Email service configuration checked',
      environment: nodeEnv,
      services: {
        resend: {
          available: hasResendKey,
          keySet: hasResendKey,
          willUse: willUseResend
        },
        smtp: {
          available: hasSmtpConfig,
          configured: hasSmtpConfig,
          willUse: !willUseResend
        }
      },
      selectedService: willUseResend ? 'resend' : 'smtp',
      timestamp: new Date().toISOString()
    })
  }
}
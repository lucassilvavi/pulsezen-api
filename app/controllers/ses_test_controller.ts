import { HttpContext } from '@adonisjs/core/http'
import { SESEmailService } from '#services/ses_email_service'
import env from '#start/env'

export default class SESTestController {
  /**
   * Verify AWS SES configuration
   */
  async checkConfiguration({ response }: HttpContext) {
    try {
      const config = await SESEmailService.verifyConfiguration()
      
      return response.json({
        success: true,
        message: 'AWS SES configuration verified',
        config: {
          provider: 'aws-ses',
          region: env.get('AWS_REGION', 'us-east-1'),
          hasAccessKey: !!env.get('AWS_ACCESS_KEY_ID'),
          hasSecretKey: !!env.get('AWS_SECRET_ACCESS_KEY'),
          fromEmail: env.get('SES_FROM_EMAIL', 'not-configured'),
          configured: config.configured
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'AWS SES configuration check failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code
        },
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Test AWS SES email sending
   */
  async testEmail({ response }: HttpContext) {
    try {
      console.log('🧪 Testing AWS SES email sending...')
      
      const testEmail = env.get('TEST_EMAIL', 'acalmarapp@gmail.com')
      const fromEmail = env.get('SES_FROM_EMAIL', 'noreply@acalmar.space')
      
      const result = await SESEmailService.sendEmail({
        to: testEmail,
        from: fromEmail,
        subject: '🧪 AWS SES Test - Acalmar API',
        html: `
          <h2>🧪 AWS SES Test Success!</h2>
          <p>Este email foi enviado usando AWS SES em produção.</p>
          <p><strong>Environment:</strong> ${env.get('NODE_ENV')}</p>
          <p><strong>Region:</strong> ${env.get('AWS_REGION', 'us-east-1')}</p>
          <p><strong>From:</strong> ${fromEmail}</p>
          <p><strong>To:</strong> ${testEmail}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>✅ Success:</strong> AWS SES está funcionando perfeitamente!
          </div>
        `,
        text: `
AWS SES Test Success!

Este email foi enviado usando AWS SES em produção.

Environment: ${env.get('NODE_ENV')}
Region: ${env.get('AWS_REGION', 'us-east-1')}
From: ${fromEmail}
To: ${testEmail}
Timestamp: ${new Date().toISOString()}

✅ Success: AWS SES está funcionando perfeitamente!
        `
      })

      console.log('✅ AWS SES test email sent successfully:', result)

      return response.json({
        success: true,
        message: 'AWS SES test email sent successfully',
        result: {
          messageId: result.messageId,
          provider: result.provider,
          to: testEmail,
          from: fromEmail
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ AWS SES test failed:', error)
      
      return response.status(500).json({
        success: false,
        message: 'AWS SES test email failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code || 'UNKNOWN',
          stack: error.stack?.split('\n').slice(0, 5)
        },
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Test password reset email specifically
   */
  async testPasswordReset({ response }: HttpContext) {
    try {
      console.log('🔐 Testing password reset email via AWS SES...')
      
      const testEmail = env.get('TEST_EMAIL', 'acalmarapp@gmail.com')
      const testCode = '123456'
      const testUserName = 'Lucas (Teste)'
      
      const result = await SESEmailService.sendPasswordResetEmail(
        testEmail,
        testCode,
        testUserName
      )

      console.log('✅ Password reset email sent successfully:', result)

      return response.json({
        success: true,
        message: 'Password reset email test completed successfully',
        result: {
          messageId: result.messageId,
          provider: result.provider,
          to: testEmail,
          code: testCode,
          userName: testUserName
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Password reset email test failed:', error)
      
      return response.status(500).json({
        success: false,
        message: 'Password reset email test failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code || 'UNKNOWN'
        },
        timestamp: new Date().toISOString()
      })
    }
  }
}
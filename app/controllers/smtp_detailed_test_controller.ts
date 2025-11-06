import { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export default class SmtpDetailedTestController {
  /**
   * Test SMTP connection with detailed error information
   */
  async testSmtpConnection({ response }: HttpContext) {
    try {
      console.log('🔄 Testing SMTP connection with detailed logging...')
      
      // Get SMTP configuration
      const smtpConfig = {
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT'),
        username: env.get('SMTP_USERNAME'),
        password: env.get('SMTP_PASSWORD'),
      }
      
      console.log('📧 SMTP Config:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        username: smtpConfig.username,
        passwordLength: smtpConfig.password?.length,
        passwordFirst3: smtpConfig.password?.substring(0, 3),
        passwordLast3: smtpConfig.password?.substring(smtpConfig.password.length - 3),
      })

      // Try to send a test email with detailed error handling
      const result = await mail.send((message) => {
        message
          .to('lucas.vieira789lv@gmail.com')
          .from('acalmarapp@gmail.com', 'PulseZen Test')
          .subject('🔧 SMTP Connection Test')
          .html(`
            <h2>🔧 SMTP Connection Test</h2>
            <p>Se você está vendo este email, o SMTP está funcionando!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Host: ${smtpConfig.host}</p>
            <p>Port: ${smtpConfig.port}</p>
          `)
      })

      console.log('✅ SMTP test successful:', result)

      return response.json({
        success: true,
        message: 'SMTP connection test successful',
        config: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          username: smtpConfig.username,
          passwordLength: smtpConfig.password?.length,
        },
        result: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ SMTP test failed with detailed error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        hostname: error.hostname,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack?.split('\n').slice(0, 10)
      })
      
      return response.status(500).json({
        success: false,
        message: 'SMTP connection test failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code || 'UNKNOWN',
          errno: error.errno,
          syscall: error.syscall,
          hostname: error.hostname,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode,
          rawError: error.toString()
        },
        timestamp: new Date().toISOString()
      })
    }
  }
}
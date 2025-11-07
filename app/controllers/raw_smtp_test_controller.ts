import { HttpContext } from '@adonisjs/core/http'
import nodemailer from 'nodemailer'
import env from '#start/env'

export default class RawSmtpTestController {
  /**
   * Test raw SMTP connection using nodemailer directly
   */
  async testRawSmtp({ response }: HttpContext) {
    try {
      console.log('🔧 Starting raw SMTP test with nodemailer...')
      
      const smtpConfig = {
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT'),
        secure: true, // true for 465
        auth: {
          user: env.get('SMTP_USERNAME'),
          pass: env.get('SMTP_PASSWORD'),
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000,
        socketTimeout: 10000,
        debug: true, // Enable debug logs
        logger: true // Enable logging
      }
      
      console.log('📧 Creating transporter with config:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.auth.user,
        passwordLength: smtpConfig.auth.pass?.length
      })
      
      // Create transporter
      const transporter = nodemailer.createTransport(smtpConfig)
      
      console.log('🔍 Verifying SMTP connection...')
      
      // Test connection
      const verified = await transporter.verify()
      
      console.log('✅ SMTP connection verified:', verified)
      
      // Try to send actual email
      console.log('📤 Sending test email...')
      const info = await transporter.sendMail({
        from: env.get('SMTP_USERNAME'),
        to: 'lucas.vieira789lv@gmail.com',
        subject: '🔧 Raw SMTP Test',
        html: `
          <h2>🔧 Raw SMTP Test Success!</h2>
          <p>Este email foi enviado usando nodemailer diretamente.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      })
      
      console.log('✅ Email sent successfully:', info)
      
      return response.json({
        success: true,
        message: 'Raw SMTP test completed successfully',
        verification: verified,
        emailInfo: info,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Raw SMTP test failed:', error)
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      console.error('Error stack:', error.stack)
      
      return response.status(500).json({
        success: false,
        message: 'Raw SMTP test failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          hostname: error.hostname,
          address: error.address,
          port: error.port,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode,
          stack: error.stack?.split('\n').slice(0, 10),
          fullErrorString: error.toString(),
          fullErrorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
        },
        timestamp: new Date().toISOString()
      })
    }
  }
}
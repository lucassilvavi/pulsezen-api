import { HttpContext } from '@adonisjs/core/http'
import nodemailer from 'nodemailer'
import env from '#start/env'

export default class AlternativeSmtpController {
  /**
   * Test SMTP with port 587 (STARTTLS) instead of 465 (SSL)
   */
  async testPort587({ response }: HttpContext) {
    try {
      console.log('🔧 Testing SMTP with port 587 (STARTTLS)...')
      
      const smtpConfig = {
        host: env.get('SMTP_HOST'), // smtp.gmail.com
        port: 587, // STARTTLS port instead of 465
        secure: false, // false for STARTTLS
        requireTLS: true,
        auth: {
          user: env.get('SMTP_USERNAME'),
          pass: env.get('SMTP_PASSWORD'),
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        debug: true,
        logger: true
      }
      
      console.log('📧 Testing port 587 config:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        requireTLS: smtpConfig.requireTLS,
        username: smtpConfig.auth.user
      })
      
      const transporter = nodemailer.createTransport(smtpConfig)
      
      console.log('🔍 Verifying port 587 connection...')
      const verified = await transporter.verify()
      
      console.log('✅ Port 587 connection verified:', verified)
      
      const info = await transporter.sendMail({
        from: env.get('SMTP_USERNAME'),
        to: 'lucas.vieira789lv@gmail.com',
        subject: '🔧 Port 587 SMTP Test',
        html: `
          <h2>🔧 Port 587 (STARTTLS) Test Success!</h2>
          <p>Este email foi enviado usando porta 587 em vez de 465.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      })
      
      console.log('✅ Email sent via port 587:', info)
      
      return response.json({
        success: true,
        message: 'Port 587 SMTP test successful',
        config: {
          port: 587,
          secure: false,
          requireTLS: true
        },
        verification: verified,
        emailInfo: info,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Port 587 test failed:', error)
      console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      
      return response.status(500).json({
        success: false,
        message: 'Port 587 SMTP test failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack?.split('\n').slice(0, 5)
        },
        timestamp: new Date().toISOString()
      })
    }
  }
}
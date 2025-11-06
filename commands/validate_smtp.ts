import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'

export default class ValidateSmtp extends BaseCommand {
  static commandName = 'validate:smtp'
  static description = 'Validate SMTP configuration'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('🔍 Validating SMTP Configuration...')

    try {
      // Check environment variables
      const smtpConfig = {
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT'),
        username: env.get('SMTP_USERNAME'),
        password: env.get('SMTP_PASSWORD'),
      }

      this.logger.info('📧 SMTP Environment Variables:')
      this.logger.info(`Host: ${smtpConfig.host}`)
      this.logger.info(`Port: ${smtpConfig.port}`)
      this.logger.info(`Username: ${smtpConfig.username}`)
      this.logger.info(`Password: ${smtpConfig.password ? '*'.repeat(smtpConfig.password.length) : 'NOT SET'}`)

      // Check for common issues
      if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
        this.logger.error('❌ Missing required SMTP configuration!')
        return
      }

      if (smtpConfig.password.startsWith(' ') || smtpConfig.password.endsWith(' ')) {
        this.logger.warning('⚠️  SMTP password has leading/trailing spaces!')
      }

      if (smtpConfig.host !== 'smtp.gmail.com') {
        this.logger.warning(`⚠️  Using non-Gmail SMTP: ${smtpConfig.host}`)
      }

      if (String(smtpConfig.port) !== '465') {
        this.logger.warning(`⚠️  Using non-standard port: ${smtpConfig.port}`)
      }

      // Test email sending (optional)
      const testEmail = await this.prompt.ask('Enter email to test (or press Enter to skip)')
      
      if (testEmail) {
        this.logger.info('📤 Sending test email...')
        
        try {
          await mail.send((message) => {
            message
              .to(testEmail)
              .from(smtpConfig.username, 'PulseZen - SMTP Test')
              .subject('SMTP Configuration Test')
              .html(`
                <h1>SMTP Test Successful!</h1>
                <p>Your SMTP configuration is working correctly.</p>
                <p><strong>Config tested:</strong></p>
                <ul>
                  <li>Host: ${smtpConfig.host}</li>
                  <li>Port: ${smtpConfig.port}</li>
                  <li>Username: ${smtpConfig.username}</li>
                </ul>
                <p>Timestamp: ${new Date().toISOString()}</p>
              `)
          })

          this.logger.success('✅ Test email sent successfully!')
        } catch (emailError) {
          this.logger.error('❌ Failed to send test email:', emailError.message)
          
          // Provide specific error guidance
          if (emailError.message.includes('authentication')) {
            this.logger.error('🔑 Authentication failed - check username/password')
          } else if (emailError.message.includes('connection')) {
            this.logger.error('🌐 Connection failed - check host/port')
          } else if (emailError.message.includes('timeout')) {
            this.logger.error('⏰ Timeout - check network connectivity')
          }
        }
      }

      this.logger.success('✅ SMTP validation completed!')

    } catch (error) {
      this.logger.error('❌ SMTP validation failed:', error.message)
    }
  }
}
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { StructuredLogger } from '#services/structured_logger'
import env from '#start/env'

export default class MailTestController {
  /**
   * POST /api/test/email
   * Test email configuration (only in development)
   */
  async testEmail({ request, response }: HttpContext) {
    try {
      // Only allow in development/staging
      if (env.get('NODE_ENV') === 'production') {
        return response.status(403).json({
          success: false,
          error: 'Not allowed in production',
          message: 'Este endpoint não está disponível em produção'
        })
      }

      const { to } = request.only(['to'])
      
      if (!to) {
        return response.status(400).json({
          success: false,
          error: 'Missing email',
          message: 'Email de destino é obrigatório'
        })
      }

      StructuredLogger.info('Testing email configuration', {
        to,
        smtpConfig: {
          host: env.get('SMTP_HOST'),
          port: env.get('SMTP_PORT'),
          username: env.get('SMTP_USERNAME'),
          secure: true
        }
      })

      await mail.send((message) => {
        message
          .to(to)
          .from(env.get('SMTP_USERNAME'), 'PulseZen - Test')
          .subject('Teste de Configuração SMTP - PulseZen')
          .html(`
            <h1>Teste de Email</h1>
            <p>Se você recebeu este email, a configuração SMTP está funcionando corretamente.</p>
            <p><strong>Configurações testadas:</strong></p>
            <ul>
              <li>Host: ${env.get('SMTP_HOST')}</li>
              <li>Port: ${env.get('SMTP_PORT')}</li>
              <li>Username: ${env.get('SMTP_USERNAME')}</li>
              <li>Secure: true</li>
            </ul>
            <p>Timestamp: ${new Date().toISOString()}</p>
          `)
      })

      StructuredLogger.info('Test email sent successfully', { to })

      return response.status(200).json({
        success: true,
        message: `Email de teste enviado para ${to}. Verifique sua caixa de entrada.`
      })

    } catch (error) {
      StructuredLogger.error('Error sending test email', {
        error,
        smtpConfig: {
          host: env.get('SMTP_HOST'),
          port: env.get('SMTP_PORT'),
          username: env.get('SMTP_USERNAME')
        }
      })

      return response.status(500).json({
        success: false,
        error: 'Email test failed',
        message: 'Falha ao enviar email de teste',
        details: error.message
      })
    }
  }

  /**
   * GET /api/test/smtp-config
   * Check SMTP configuration (only in development)
   */
  async checkConfig({ response }: HttpContext) {
    try {
      // Only allow in development/staging
      if (env.get('NODE_ENV') === 'production') {
        return response.status(403).json({
          success: false,
          error: 'Not allowed in production',
          message: 'Este endpoint não está disponível em produção'
        })
      }

      const smtpConfig = {
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT'),
        username: env.get('SMTP_USERNAME'),
        passwordSet: !!env.get('SMTP_PASSWORD'),
        passwordLength: env.get('SMTP_PASSWORD')?.length || 0,
        secure: true
      }

      StructuredLogger.info('SMTP configuration check', smtpConfig)

      return response.status(200).json({
        success: true,
        config: smtpConfig,
        message: 'Configuração SMTP verificada'
      })

    } catch (error) {
      StructuredLogger.error('Error checking SMTP config', error)

      return response.status(500).json({
        success: false,
        error: 'Config check failed',
        message: 'Falha ao verificar configuração SMTP'
      })
    }
  }
}
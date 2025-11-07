import { Resend } from 'resend'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import { StructuredLogger } from '#services/structured_logger'

export interface EmailOptions {
  to: string
  from?: string
  subject: string
  html?: string
  text?: string
  template?: {
    name: string
    data: any
  }
}

export class HybridEmailService {
  private static resend: Resend | null = null

  /**
   * Initialize Resend client for production
   */
  private static getResendClient(): Resend {
    if (!this.resend) {
      const apiKey = env.get('RESEND_API_KEY')
      if (!apiKey) {
        throw new Error('RESEND_API_KEY not configured')
      }
      this.resend = new Resend(apiKey)
    }
    return this.resend
  }

  /**
   * Check if we should use Resend (production) or SMTP (development)
   */
  private static shouldUseResend(): boolean {
    const nodeEnv = env.get('NODE_ENV')
    const resendApiKey = env.get('RESEND_API_KEY')
    
    StructuredLogger.info('Email service selection', {
      nodeEnv,
      hasResendApiKey: !!resendApiKey,
      willUseResend: nodeEnv === 'production' && !!resendApiKey
    })
    
    return nodeEnv === 'production' && !!resendApiKey
  }

  /**
   * Send email using Resend API (production)
   */
  private static async sendWithResend(options: EmailOptions): Promise<any> {
    try {
      StructuredLogger.info('Sending email with Resend API', {
        to: options.to,
        subject: options.subject,
        from: options.from
      })

      const resend = this.getResendClient()
      
      const emailData: any = {
        from: options.from || 'PulseZen <noreply@resend.dev>', // Resend default domain
        to: [options.to],
        subject: options.subject
      }

      if (options.html) {
        emailData.html = options.html
      }
      
      if (options.text) {
        emailData.text = options.text
      }

      const result = await resend.emails.send(emailData)
      
      StructuredLogger.info('Resend email sent successfully', {
        to: options.to,
        messageId: result.data?.id,
        result: result
      })

      return result
    } catch (error) {
      StructuredLogger.error('Resend email failed', {
        error: error.message,
        to: options.to,
        subject: options.subject
      })
      throw error
    }
  }

  /**
   * Send email using SMTP (development)
   */
  private static async sendWithSmtp(options: EmailOptions): Promise<any> {
    try {
      StructuredLogger.info('Sending email with SMTP (development)', {
        to: options.to,
        subject: options.subject,
        from: options.from
      })

      const result = await mail.send((message) => {
        message
          .to(options.to)
          .from(options.from || env.get('SMTP_USERNAME'), 'PulseZen')
          .subject(options.subject)

        if (options.template) {
          message.htmlView(options.template.name, options.template.data)
        } else if (options.html) {
          message.html(options.html)
        }
        
        if (options.text) {
          message.text(options.text)
        }
      })

      StructuredLogger.info('SMTP email sent successfully', {
        to: options.to,
        result: result
      })

      return result
    } catch (error) {
      StructuredLogger.error('SMTP email failed', {
        error: error.message,
        to: options.to,
        subject: options.subject
      })
      throw error
    }
  }

  /**
   * Send email using the appropriate service based on environment
   */
  static async send(options: EmailOptions): Promise<any> {
    const useResend = this.shouldUseResend()
    
    StructuredLogger.info('Hybrid email service sending', {
      to: options.to,
      subject: options.subject,
      service: useResend ? 'resend' : 'smtp',
      environment: env.get('NODE_ENV')
    })

    if (useResend) {
      return this.sendWithResend(options)
    } else {
      return this.sendWithSmtp(options)
    }
  }

  /**
   * Send password reset email with proper template
   */
  static async sendPasswordReset(email: string, code: string, userName?: string): Promise<any> {
    const useResend = this.shouldUseResend()
    
    if (useResend) {
      // Use HTML directly for Resend (production)
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperação de Senha - PulseZen</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4A90E2;">PulseZen</h1>
          </div>
          
          <h2 style="color: #333;">Recuperação de Senha</h2>
          
          <p>Olá ${userName || email},</p>
          
          <p>Você solicitou a recuperação de sua senha. Use o código abaixo para redefinir sua senha:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #4A90E2; letter-spacing: 4px;">${code}</span>
          </div>
          
          <p style="color: #666;">Este código expira em 1 hora.</p>
          
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            PulseZen - Cuidando do seu bem-estar mental
          </p>
        </body>
        </html>
      `

      return this.send({
        to: email,
        from: 'PulseZen <noreply@resend.dev>',
        subject: 'Recuperação de Senha - PulseZen',
        html
      })
    } else {
      // Use template for SMTP (development)
      return this.send({
        to: email,
        subject: 'Recuperação de Senha - PulseZen',
        template: {
          name: 'emails/password_reset',
          data: {
            userName: userName || email,
            code,
            expiresIn: '1 hora'
          }
        }
      })
    }
  }
}
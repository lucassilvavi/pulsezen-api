import { Resend } from 'resend'
import { StructuredLogger } from '#services/structured_logger'
import env from '#start/env'

export interface ResendEmailOptions {
  to: string | string[]
  from: string
  subject: string
  html?: string
  text?: string
}

export class ResendEmailService {
  private static client: Resend | null = null

  /**
   * Initialize Resend client with API key
   */
  private static getClient(): Resend {
    if (!this.client) {
      const apiKey = env.get('RESEND_API_KEY')

      if (!apiKey) {
        throw new Error('RESEND_API_KEY not configured. Please set it in your .env file')
      }

      this.client = new Resend(apiKey)

      StructuredLogger.info('Resend client initialized', {
        hasApiKey: !!apiKey
      })
    }

    return this.client
  }

  /**
   * Send email using Resend
   */
  static async sendEmail(options: ResendEmailOptions): Promise<any> {
    try {
      StructuredLogger.info('Sending email with Resend', {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: options.from,
        subject: options.subject
      })

      const client = this.getClient()

      const toAddresses = Array.isArray(options.to) ? options.to : [options.to]

      const { data, error } = await client.emails.send({
        from: options.from,
        to: toAddresses,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      if (error) {
        StructuredLogger.error('Failed to send email with Resend', {
          error: error.message,
          to: toAddresses,
          subject: options.subject
        })
        throw new Error(`Resend error: ${error.message}`)
      }

      StructuredLogger.info('Email sent successfully with Resend', {
        messageId: data?.id,
        to: toAddresses,
        subject: options.subject
      })

      return {
        MessageId: data?.id,
        success: true
      }

    } catch (error) {
      StructuredLogger.error('Error sending email with Resend', {
        error: error.message,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject
      })
      throw error
    }
  }

  /**
   * Send password reset email with 6-digit code
   */
  static async sendPasswordResetEmail(
    email: string,
    code: string,
    userName: string
  ): Promise<any> {
    const fromEmail = env.get('EMAIL_FROM', 'onboarding@resend.dev')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de Senha - Acalmar</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🌸 Acalmar</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Recuperação de Senha</h2>
                      
                      <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                        Olá, ${userName}! Recebemos uma solicitação para redefinir a senha da sua conta no Acalmar.
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.5;">
                        Use o código abaixo para criar uma nova senha:
                      </p>
                      
                      <!-- Code Display -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 0 0 30px;">
                            <div style="display: inline-block; padding: 20px 40px; background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px;">
                              <p style="margin: 0; color: #667eea; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${code}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="margin: 30px 0 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                          ⚠️ <strong>Importante:</strong> Este código expira em 1 hora por segurança.
                        </p>
                      </div>
                      
                      <div style="margin: 20px 0 0; padding: 20px; background-color: #f8f9fa; border-radius: 4px;">
                        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
                          Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                        Acalmar - Seu espaço de bem-estar mental
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} Acalmar. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    const text = `
Recuperação de Senha - Acalmar

Olá, ${userName}! Recebemos uma solicitação para redefinir a senha da sua conta no Acalmar.

Seu código de recuperação:
${code}

⚠️ Importante: Este código expira em 1 hora por segurança.

Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.

---
Acalmar - Seu espaço de bem-estar mental
© ${new Date().getFullYear()} Acalmar. Todos os direitos reservados.
    `

    return await this.sendEmail({
      to: email,
      from: fromEmail,
      subject: '🔐 Código de Recuperação - Acalmar',
      html,
      text,
    })
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const fromEmail = env.get('EMAIL_FROM', 'noreply@acalmar.space')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo ao Acalmar</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px;">
          <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🌸 Bem-vindo ao Acalmar!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px; color: #333333;">Olá, ${userName}!</h2>
                <p style="margin: 0 0 20px; color: #666666; line-height: 1.5;">
                  Estamos muito felizes em tê-lo conosco. O Acalmar é seu espaço pessoal para cuidar da sua saúde mental e bem-estar.
                </p>
                <p style="margin: 0; color: #666666; line-height: 1.5;">
                  Explore nossos recursos e comece sua jornada de autoconhecimento hoje mesmo!
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                <p style="margin: 0; color: #999999; font-size: 12px;">
                  © ${new Date().getFullYear()} Acalmar. Todos os direitos reservados.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    await this.sendEmail({
      to: email,
      from: fromEmail,
      subject: '🌸 Bem-vindo ao Acalmar!',
      html,
      text: `Bem-vindo ao Acalmar, ${userName}! Estamos felizes em tê-lo conosco.`,
    })
  }
}

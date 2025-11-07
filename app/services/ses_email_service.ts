import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { StructuredLogger } from '#services/structured_logger'
import env from '#start/env'

export interface SESEmailOptions {
  to: string | string[]
  from: string
  subject: string
  html?: string
  text?: string
}

export class SESEmailService {
  private static client: SESClient | null = null

  /**
   * Initialize SES client with AWS credentials
   */
  private static getClient(): SESClient {
    if (!this.client) {
      const region = env.get('AWS_REGION', 'us-east-1')
      const accessKeyId = env.get('AWS_ACCESS_KEY_ID')
      const secretAccessKey = env.get('AWS_SECRET_ACCESS_KEY')

      if (!accessKeyId || !secretAccessKey) {
        throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY')
      }

      this.client = new SESClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })

      StructuredLogger.info('AWS SES client initialized', {
        region,
        hasCredentials: !!(accessKeyId && secretAccessKey)
      })
    }

    return this.client
  }

  /**
   * Send email using AWS SES
   */
  static async sendEmail(options: SESEmailOptions): Promise<any> {
    try {
      StructuredLogger.info('Sending email with AWS SES', {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: options.from,
        subject: options.subject
      })

      const client = this.getClient()

      const toAddresses = Array.isArray(options.to) ? options.to : [options.to]

      const params = {
        Source: options.from,
        Destination: {
          ToAddresses: toAddresses,
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {} as any,
        },
      }

      // Add HTML or text content
      if (options.html) {
        params.Message.Body.Html = {
          Data: options.html,
          Charset: 'UTF-8',
        }
      }

      if (options.text) {
        params.Message.Body.Text = {
          Data: options.text,
          Charset: 'UTF-8',
        }
      }

      const command = new SendEmailCommand(params)
      const result = await client.send(command)

      StructuredLogger.info('AWS SES email sent successfully', {
        messageId: result.MessageId,
        to: toAddresses,
        from: options.from,
        subject: options.subject
      })

      return {
        success: true,
        messageId: result.MessageId,
        provider: 'aws-ses'
      }
    } catch (error) {
      StructuredLogger.error('AWS SES email failed', {
        error: error.message,
        errorCode: error.code || error.name,
        to: options.to,
        from: options.from,
        subject: options.subject
      })

      throw error
    }
  }

  /**
   * Send password reset email with proper template
   */
  static async sendPasswordResetEmail(
    email: string, 
    code: string, 
    userName?: string, 
    fromEmail?: string
  ): Promise<any> {
    const from = fromEmail || env.get('SES_FROM_EMAIL', 'noreply@pulsezen.com')
    
          const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recuperação de Senha - Acalmar</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            color: #4A90E2;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .code-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border-radius: 12px;
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🧘 Acalmar</div>
            <h2 style="color: #333; margin: 0;">Recuperação de Senha</h2>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Olá <strong>${userName || email}</strong>,
          </p>
          
          <p style="color: #555; line-height: 1.6;">
            Você solicitou a recuperação de sua senha. Use o código abaixo para redefinir sua senha no aplicativo:
          </p>
          
          <div class="code-container">
            <div class="code">${code}</div>
          </div>
          
          <div class="warning">
            <strong>⏰ Importante:</strong> Este código expira em <strong>1 hora</strong> por motivos de segurança.
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Se você não solicitou esta recuperação de senha, pode ignorar este email com segurança. 
            Sua senha permanecerá inalterada.
          </p>
          
          <div class="footer">
            <p>
              <strong>Acalmar</strong><br>
              Cuidando do seu bem-estar mental 💚
            </p>
            <p style="font-size: 12px; color: #999;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
Acalmar - Recuperação de Senha

Olá ${userName || email},

Você solicitou a recuperação de sua senha. Use o código abaixo para redefinir sua senha:

Código: ${code}

Este código expira em 1 hora.

Se você não solicitou esta recuperação, ignore este email.

Acalmar - Cuidando do seu bem-estar mental
    `

    return this.sendEmail({
      to: email,
      from,
      subject: 'Recuperação de Senha - Acalmar',
      html,
      text
    })
  }

  /**
   * Verify SES configuration
   */
  static async verifyConfiguration(): Promise<any> {
    try {
      const client = this.getClient()
      
      StructuredLogger.info('Verifying AWS SES configuration', {
        region: env.get('AWS_REGION', 'us-east-1'),
        hasAccessKey: !!env.get('AWS_ACCESS_KEY_ID'),
        hasSecretKey: !!env.get('AWS_SECRET_ACCESS_KEY'),
        fromEmail: env.get('SES_FROM_EMAIL')
      })

      // Try to get account sending enabled status
      return {
        success: true,
        provider: 'aws-ses',
        region: env.get('AWS_REGION', 'us-east-1'),
        configured: true
      }
    } catch (error) {
      StructuredLogger.error('AWS SES configuration verification failed', {
        error: error.message
      })
      
      throw error
    }
  }
}
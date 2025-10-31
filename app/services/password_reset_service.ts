import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import mail from '@adonisjs/mail/services/main'
import { StructuredLogger } from '#services/structured_logger'
import env from '#start/env'

export interface RequestPasswordResetResponse {
  success: boolean
  message: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

export interface ValidateTokenResponse {
  success: boolean
  message?: string
  email?: string
}

export default class PasswordResetService {
  /**
   * Request a password reset - sends email with token
   */
  static async requestPasswordReset(email: string): Promise<RequestPasswordResetResponse> {
    try {
      StructuredLogger.info('Password reset requested', { email })
      
      // Find user by email (ignoring soft deletes)
      const user = await User.query()
        .where('email', email)
        .whereNull('deleted_at')
        .first()
      
      StructuredLogger.info('User search result', { 
        email, 
        found: !!user,
        userId: user?.id 
      })
      
      if (!user) {
        StructuredLogger.info('Password reset requested for non-existent email', { email })
        return {
          success: false,
          message: 'Email não encontrado. Verifique se digitou corretamente.'
        }
      }

      StructuredLogger.info('User found for password reset', { userId: user.id, email: user.email })

      // Generate secure random token (for internal use)
      const token = crypto.randomBytes(32).toString('hex')
      
      // Generate 6-digit code for user
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      StructuredLogger.info('Code generated', { codeLength: code.length })
      
      // Token expires in 1 hour
      const expiresAt = DateTime.now().plus({ hours: 1 })

      // Invalidate any existing unused tokens for this user
      StructuredLogger.info('Invalidating old tokens', { userId: user.id })
      await PasswordResetToken
        .query()
        .where('user_id', user.id)
        .where('used', false)
        .update({ used: true })

      // Create new token with code
      StructuredLogger.info('Creating new token', { userId: user.id, email: user.email })
      const resetToken = await PasswordResetToken.create({
        userId: user.id,
        token,
        code,
        email: user.email,
        expiresAt,
        used: false
      })
      StructuredLogger.info('Token created successfully', { tokenId: resetToken.id, code })

      // Send email with code
      StructuredLogger.info('Sending password reset email', { email: user.email, code })
      
      await mail.send((message) => {
        message
          .to(user.email)
          .from(env.get('SMTP_USERNAME'), 'PulseZen')
          .subject('Recuperação de Senha - PulseZen')
          .htmlView('emails/password_reset', {
            userName: user.profile?.firstName || user.email,
            code,
            expiresIn: '1 hora'
          })
      })

      StructuredLogger.info('Password reset email sent successfully', {
        userId: user.id,
        email: user.email,
        tokenId: resetToken.id,
        code
      })

      return {
        success: true,
        message: `Código de verificação enviado para ${user.email}. Verifique sua caixa de entrada.`
      }
    } catch (error) {
      StructuredLogger.error('Error requesting password reset', { error, email })
      console.error('Password reset error details:', error)
      return {
        success: false,
        message: 'Erro ao solicitar recuperação de senha. Tente novamente mais tarde.'
      }
    }
  }

  /**
   * Validate if a reset token is valid
   */
  static async validateToken(token: string): Promise<ValidateTokenResponse> {
    try {
      const resetToken = await PasswordResetToken
        .query()
        .where('token', token)
        .where('used', false)
        .first()

      if (!resetToken) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        }
      }

      // Check if token has expired
      if (resetToken.expiresAt < DateTime.now()) {
        return {
          success: false,
          message: 'Token expirado. Solicite uma nova recuperação de senha.'
        }
      }

      return {
        success: true,
        email: resetToken.email
      }
    } catch (error) {
      StructuredLogger.error('Error validating reset token', error)
      return {
        success: false,
        message: 'Erro ao validar token'
      }
    }
  }

  /**
   * Verify 6-digit code (for mobile app)
   */
  static async verifyCode(email: string, code: string): Promise<ValidateTokenResponse> {
    try {
      const resetToken = await PasswordResetToken
        .query()
        .where('email', email)
        .where('code', code)
        .where('used', false)
        .first()

      if (!resetToken) {
        StructuredLogger.info('Code verification failed - not found', { email, code })
        return {
          success: false,
          message: 'Código inválido ou expirado'
        }
      }

      // Check if token has expired
      if (resetToken.expiresAt < DateTime.now()) {
        StructuredLogger.info('Code verification failed - expired', { email, code })
        return {
          success: false,
          message: 'Código expirado. Solicite um novo código.'
        }
      }

      StructuredLogger.info('Code verified successfully', { 
        email, 
        code,
        tokenId: resetToken.id 
      })

      return {
        success: true,
        email: resetToken.email
      }
    } catch (error) {
      StructuredLogger.error('Error verifying code', error)
      return {
        success: false,
        message: 'Erro ao verificar código'
      }
    }
  }

  /**
   * Reset password with code (for mobile app)
   */
  static async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      // Validate code
      const resetToken = await PasswordResetToken
        .query()
        .where('email', email)
        .where('code', code)
        .where('used', false)
        .first()

      if (!resetToken) {
        return {
          success: false,
          message: 'Código inválido ou expirado'
        }
      }

      // Check if token has expired
      if (resetToken.expiresAt < DateTime.now()) {
        return {
          success: false,
          message: 'Código expirado. Solicite um novo código.'
        }
      }

      // Hash the new password using bcrypt (same as register)
      const passwordHash = await bcrypt.hash(newPassword, 12)

      // Update user password
      await User
        .query()
        .where('id', resetToken.userId)
        .update({ passwordHash })

      // Mark token as used
      resetToken.used = true
      await resetToken.save()

      StructuredLogger.info('Password reset with code successfully', {
        userId: resetToken.userId,
        email: resetToken.email,
        code
      })

      return {
        success: true,
        message: 'Senha alterada com sucesso! Você já pode fazer login com a nova senha.'
      }
    } catch (error) {
      StructuredLogger.error('Error resetting password with code', error)
      return {
        success: false,
        message: 'Erro ao redefinir senha. Tente novamente mais tarde.'
      }
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      // Validate token
      const resetToken = await PasswordResetToken
        .query()
        .where('token', token)
        .where('used', false)
        .preload('user')
        .first()

      if (!resetToken) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        }
      }

      // Check if token has expired
      if (resetToken.expiresAt < DateTime.now()) {
        return {
          success: false,
          message: 'Token expirado. Solicite uma nova recuperação de senha.'
        }
      }

      // Hash the new password using bcrypt (same as register)
      const passwordHash = await bcrypt.hash(newPassword, 12)

      // Update user password
      await User
        .query()
        .where('id', resetToken.userId)
        .update({ passwordHash })

      // Mark token as used
      resetToken.used = true
      await resetToken.save()

      StructuredLogger.info('Password reset successfully', {
        userId: resetToken.userId,
        email: resetToken.email
      })

      return {
        success: true,
        message: 'Senha alterada com sucesso! Você já pode fazer login com a nova senha.'
      }
    } catch (error) {
      StructuredLogger.error('Error resetting password', error)
      return {
        success: false,
        message: 'Erro ao redefinir senha. Tente novamente mais tarde.'
      }
    }
  }
}

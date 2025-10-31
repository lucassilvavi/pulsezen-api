import type { HttpContext } from '@adonisjs/core/http'
import PasswordResetService from '#services/password_reset_service'
import { StructuredLogger } from '#services/structured_logger'
import vine from '@vinejs/vine'

export default class PasswordResetController {
  /**
   * POST /password-reset/request
   * Request a password reset email
   */
  async requestReset({ request, response }: HttpContext) {
    try {
      // Validate input
      const schema = vine.object({
        email: vine.string().email().trim()
      })

      const data = await vine.validate({ schema, data: request.all() })

      const result = await PasswordResetService.requestPasswordReset(data.email)

      if (!result.success) {
        return response.status(404).json({
          success: false,
          error: 'Email not found',
          message: result.message
        })
      }

      StructuredLogger.info('Password reset requested via API', {
        email: data.email
      })

      return response.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error) {
      if (error.messages) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Dados inválidos',
          errors: error.messages
        })
      }

      StructuredLogger.error('Error requesting password reset via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /password-reset/validate?token=xxx
   * Validate if a reset token is valid
   */
  async validateToken({ request, response }: HttpContext) {
    try {
      const token = request.input('token')

      if (!token) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Token é obrigatório'
        })
      }

      const result = await PasswordResetService.validateToken(token)

      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: 'Invalid token',
          message: result.message
        })
      }

      return response.status(200).json({
        success: true,
        data: {
          email: result.email
        }
      })
    } catch (error) {
      StructuredLogger.error('Error validating reset token via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * POST /password-reset/verify-code
   * Verify 6-digit code (for mobile app)
   */
  async verifyCode({ request, response }: HttpContext) {
    try {
      // Validate input
      const schema = vine.object({
        email: vine.string().email().trim(),
        code: vine.string().fixedLength(6).trim()
      })

      const data = await vine.validate({ schema, data: request.all() })

      const result = await PasswordResetService.verifyCode(data.email, data.code)

      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: 'Invalid code',
          message: result.message
        })
      }

      StructuredLogger.info('Code verified successfully via API', {
        email: data.email
      })

      return response.status(200).json({
        success: true,
        message: 'Código válido',
        data: {
          email: result.email
        }
      })
    } catch (error) {
      if (error.messages) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Dados inválidos',
          errors: error.messages
        })
      }

      StructuredLogger.error('Error verifying code via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * POST /password-reset/reset-with-code
   * Reset password with code (for mobile app)
   */
  async resetWithCode({ request, response }: HttpContext) {
    try {
      // Validate input
      const schema = vine.object({
        email: vine.string().email().trim(),
        code: vine.string().fixedLength(6).trim(),
        password: vine.string().minLength(8).trim(),
        password_confirmation: vine.string().minLength(8).trim()
      })

      const data = await vine.validate({ schema, data: request.all() })

      // Check if passwords match
      if (data.password !== data.password_confirmation) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'As senhas não coincidem'
        })
      }

      const result = await PasswordResetService.resetPasswordWithCode(
        data.email, 
        data.code, 
        data.password
      )

      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: result.message
        })
      }

      StructuredLogger.info('Password reset with code successfully via API', {
        email: data.email
      })

      return response.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error) {
      if (error.messages) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Dados inválidos',
          errors: error.messages
        })
      }

      StructuredLogger.error('Error resetting password with code via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * POST /password-reset/reset
   * Reset password with token
   */
  async resetPassword({ request, response }: HttpContext) {
    try {
      // Validate input
      const schema = vine.object({
        token: vine.string().trim(),
        password: vine.string().minLength(8).trim()
      })

      const data = await vine.validate({ schema, data: request.all() })

      const result = await PasswordResetService.resetPassword(data.token, data.password)

      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: result.message
        })
      }

      StructuredLogger.info('Password reset successfully via API')

      return response.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error) {
      if (error.messages) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Dados inválidos',
          errors: error.messages
        })
      }

      StructuredLogger.error('Error resetting password via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }
}

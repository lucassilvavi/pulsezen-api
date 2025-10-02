import type { HttpContext } from '@adonisjs/core/http'
import SuggestionService from '../services/suggestion_service.js'
import { StructuredLogger } from '../../../services/structured_logger.js'

export default class SuggestionController {
  /**
   * GET /suggestions/daily - Get daily suggestions for user
   */
  async getDailySuggestions({ auth, request, response }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Usuário não autenticado'
        })
      }

      const date = request.input('date') // Optional date parameter
      
      const result = await SuggestionService.getDailySuggestions(auth.userId, date)
      
      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: result.message
        })
      }

      StructuredLogger.info('Daily suggestions retrieved via API', {
        userId: auth.userId,
        date: result.data!.date,
        suggestionsCount: result.data!.suggestions.length
      })

      return response.status(200).json({
        success: true,
        data: result.data,
        message: 'Sugestões diárias obtidas com sucesso'
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving daily suggestions via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /suggestions/:id - Get specific suggestion by ID
   */
  async getSuggestion({ auth, params, response }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Usuário não autenticado'
        })
      }

      const suggestionId = params.id
      
      if (!suggestionId) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'ID da sugestão é obrigatório'
        })
      }

      const result = await SuggestionService.getSuggestionById(suggestionId, auth.userId)
      
      if (!result.success) {
        const statusCode = result.message === 'Sugestão não encontrada' || result.message === 'Sugestão não atribuída ao usuário' ? 404 : 400
        return response.status(statusCode).json({
          success: false,
          error: statusCode === 404 ? 'Not found' : 'Bad request',
          message: result.message
        })
      }

      StructuredLogger.info('Suggestion retrieved via API', {
        userId: auth.userId,
        suggestionId,
        isRead: result.data!.isRead
      })

      return response.status(200).json({
        success: true,
        data: result.data,
        message: 'Sugestão obtida com sucesso'
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving suggestion via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * POST /suggestions/:userSuggestionId/read - Mark suggestion as read
   */
  async markAsRead({ auth, params, response }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Usuário não autenticado'
        })
      }

      const userSuggestionId = params.userSuggestionId
      
      if (!userSuggestionId) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'ID da sugestão do usuário é obrigatório'
        })
      }

      const result = await SuggestionService.markAsRead(userSuggestionId, auth.userId)
      
      if (!result.success) {
        const statusCode = result.message === 'Sugestão não encontrada' ? 404 : 400
        return response.status(statusCode).json({
          success: false,
          error: statusCode === 404 ? 'Not found' : 'Bad request',
          message: result.message
        })
      }

      StructuredLogger.info('Suggestion marked as read via API', {
        userId: auth.userId,
        userSuggestionId
      })

      return response.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error) {
      StructuredLogger.error('Error marking suggestion as read via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * POST /suggestions/:userSuggestionId/rate - Rate a suggestion
   */
  async rateSuggestion({ auth, params, request, response }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Usuário não autenticado'
        })
      }

      const userSuggestionId = params.userSuggestionId
      const rating = request.input('rating')
      
      if (!userSuggestionId) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'ID da sugestão do usuário é obrigatório'
        })
      }

      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Avaliação deve ser um número entre 1 e 5'
        })
      }

      const result = await SuggestionService.rateSuggestion(userSuggestionId, auth.userId, rating)
      
      if (!result.success) {
        const statusCode = result.message === 'Sugestão não encontrada' ? 404 : 400
        return response.status(statusCode).json({
          success: false,
          error: statusCode === 404 ? 'Not found' : 'Bad request',
          message: result.message
        })
      }

      StructuredLogger.info('Suggestion rated via API', {
        userId: auth.userId,
        userSuggestionId,
        rating
      })

      return response.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error) {
      StructuredLogger.error('Error rating suggestion via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /suggestions/stats - Get user suggestion statistics
   */
  async getStats({ auth, response }: HttpContext) {
    try {
      if (!auth?.userId) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Usuário não autenticado'
        })
      }

      const result = await SuggestionService.getUserStats(auth.userId)
      
      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: result.message
        })
      }

      StructuredLogger.info('User suggestion stats retrieved via API', {
        userId: auth.userId,
        totalAssigned: result.data!.totalAssigned,
        totalRead: result.data!.totalRead
      })

      return response.status(200).json({
        success: true,
        data: result.data,
        message: 'Estatísticas obtidas com sucesso'
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving user suggestion stats via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }
}
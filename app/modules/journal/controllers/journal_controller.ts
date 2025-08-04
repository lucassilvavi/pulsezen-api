import type { HttpContext } from '@adonisjs/core/http'
import { JournalService } from '../services/journal_service.js'
import { 
  createJournalEntryValidator, 
  updateJournalEntryValidator,
  journalStatsValidator 
} from '../validators/journal_validators.js'

export default class JournalController {

  /**
   * GET /api/journal
   * Lista todas as entradas do journal do usuário autenticado
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const mood = request.input('mood')
      const search = request.input('search')

      const entries = await JournalService.getEntries(userId, {
        page,
        limit,
        moodTags: mood ? [mood] : undefined,
        search
      })

      return response.status(200).json({
        success: true,
        data: entries,
        message: 'Entradas do journal recuperadas com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * GET /api/journal/:id
   * Busca uma entrada específica do journal
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const entryId = params.id

      const entry = await JournalService.getEntryById(userId, entryId)

      if (!entry) {
        return response.notFound({
          success: false,
          message: 'Entrada do journal não encontrada'
        })
      }

      return response.ok({
        success: true,
        data: entry,
        message: 'Entrada do journal recuperada com sucesso'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * POST /api/journal
   * Cria uma nova entrada do journal
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const payload = await request.validateUsing(createJournalEntryValidator)

      const entry = await JournalService.createEntry(userId, payload)

      return response.created({
        success: true,
        data: entry,
        message: 'Entrada do journal criada com sucesso'
      })
    } catch (error) {
      if (error.status === 422) {
        return response.unprocessableEntity({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.messages
        })
      }

      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * PUT /api/journal/:id
   * Atualiza uma entrada específica do journal
   */
  async update({ auth, params, request, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const entryId = params.id
      const payload = await request.validateUsing(updateJournalEntryValidator)

      const entry = await JournalService.updateEntry(userId, entryId, payload)

      if (!entry) {
        return response.notFound({
          success: false,
          message: 'Entrada do journal não encontrada'
        })
      }

      return response.ok({
        success: true,
        data: entry,
        message: 'Entrada do journal atualizada com sucesso'
      })
    } catch (error) {
      if (error.status === 422) {
        return response.unprocessableEntity({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.messages
        })
      }

      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * DELETE /api/journal/:id
   * Remove uma entrada específica do journal
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const entryId = params.id

      const deleted = await JournalService.deleteEntry(userId, entryId)

      if (!deleted) {
        return response.notFound({
          success: false,
          message: 'Entrada do journal não encontrada'
        })
      }

      return response.ok({
        success: true,
        message: 'Entrada do journal removida com sucesso'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * GET /api/journal/prompts
   * Retorna prompts de reflexão baseados no humor
   */
  async getPrompts({ request, response }: HttpContext) {
    try {
      const category = request.input('category')

      const prompts = await JournalService.getPrompts({ category })

      return response.ok({
        success: true,
        data: prompts,
        message: 'Prompts recuperados com sucesso'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * GET /api/journal/stats
   * Retorna estatísticas do journal do usuário
   */
  async getStats({ auth, request, response }: HttpContext) {
    try {
      const userId = auth!.userId
      await request.validateUsing(journalStatsValidator)

      const stats = await JournalService.getJournalStats(userId)

      return response.ok({
        success: true,
        data: stats,
        message: 'Estatísticas recuperadas com sucesso'
      })
    } catch (error) {
      if (error.status === 422) {
        return response.unprocessableEntity({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: error.messages
        })
      }

      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * GET /api/journal/search
   * Busca entradas do journal por texto ou tags
   */
  async search({ auth, request, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const query = request.input('q')
      const category = request.input('category')
      const startDate = request.input('startDate')
      const endDate = request.input('endDate')
      const sortBy = request.input('sortBy', 'relevance')
      const sortOrder = request.input('sortOrder', 'desc')
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      if (!query || query.trim().length === 0) {
        return response.badRequest({
          success: false,
          message: 'Parâmetro de busca (q) é obrigatório'
        })
      }

      if (query.length > 500) {
        return response.badRequest({
          success: false,
          message: 'Consulta de busca muito longa (máximo 500 caracteres)'
        })
      }

      const offset = (page - 1) * limit

      const results = await JournalService.searchEntries(userId, query, {
        category,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        limit,
        offset
      })

      return response.ok({
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          hasMore: results.length === limit
        },
        message: 'Busca realizada com sucesso'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }

  /**
   * Get search suggestions
   * GET /api/journal/search/suggestions
   */
  async searchSuggestions({ auth, request, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const query = request.input('q', '')

      if (query.length < 2) {
        return response.ok({
          success: true,
          data: [],
          message: 'Query muito curta para sugestões'
        })
      }

      const suggestions = await JournalService.getSearchSuggestions(userId, query)

      return response.ok({
        success: true,
        data: suggestions,
        message: 'Sugestões obtidas com sucesso'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  }
}

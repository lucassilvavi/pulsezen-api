import type { HttpContext } from '@adonisjs/core/http'
import { JournalService } from '../services/journal_service.js'

export default class JournalController {

  async getPrompts({ request, response }: HttpContext) {
    try {
      const filters = request.qs()
      const prompts = await JournalService.getPrompts(filters)
      return response.ok({
        success: true,
        data: prompts,
        message: 'Prompts retrieved successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve prompts'
      })
    }
  }

  async index({ request, auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const filters = request.qs()
      
      // Parse pagination parameters
      const page = parseInt(filters.page) || 1
      const limit = parseInt(filters.limit) || 20
      const offset = (page - 1) * limit
      
      // Add pagination to filters
      const paginatedFilters = {
        ...filters,
        limit: limit + 1, // Get one extra to check if there are more
        offset
      }
      
      const entries = await JournalService.getEntries(userId, paginatedFilters)
      
      // Check if there are more entries
      const hasMore = entries.length > limit
      const resultEntries = hasMore ? entries.slice(0, limit) : entries
      
      return response.ok({
        success: true,
        data: resultEntries,
        pagination: {
          page,
          limit,
          hasMore,
          totalInPage: resultEntries.length
        },
        message: 'Journal entries retrieved successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve journal entries'
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const rawData = request.body()
      
      console.log('📝 Journal Controller received data:', rawData)
      
      // Enhanced DTO mapping to handle new structure
      const data = {
        content: rawData.content || '',
        title: rawData.title || 'Entrada sem título',
        mood: rawData.mood,
        tags: rawData.moodTags || rawData.tags || [], // Support both moodTags and tags
        prompts: rawData.prompts,
        promptCategory: rawData.promptCategory || 'general',
        customPrompt: rawData.customPrompt,
        privacyLevel: rawData.privacyLevel || 'private',
        metadata: rawData.metadata,
        isFavorite: rawData.isFavorite || false,
        moodTags: rawData.moodTags || [] // Add moodTags field
      }
      
      const entry = await JournalService.createEntry(userId, data)
      
      // 🔥 Regenerar predição após nova entrada de journal
      try {
        const CrisisPredictionController = (await import('#controllers/CrisisPredictionController')).default
        const predictionController = new CrisisPredictionController()
        
        // Chama o método predict em background (não bloqueia a resposta)
        setImmediate(async () => {
          try {
            await predictionController.predict({ auth, request, response } as HttpContext)
            console.log('✅ Predição regenerada automaticamente após nova entrada de journal')
          } catch (error) {
            console.error('❌ Erro ao regenerar predição:', error)
          }
        })
      } catch (error) {
        // Não falha a criação do journal se a predição falhar
        console.error('⚠️ Erro ao tentar regenerar predição:', error)
      }
      
      return response.created({
        success: true,
        data: entry,
        message: 'Journal entry created successfully'
      })
    } catch (error) {
      console.error('❌ Journal Controller error:', error)
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to create journal entry'
      })
    }
  }

  async search({ request, auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const { query, filters } = request.body()
      const results = await JournalService.searchEntries(userId, query, filters)
      
      return response.ok({
        success: true,
        data: results,
        message: 'Search completed successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Search failed'
      })
    }
  }

  async searchSuggestions({ response }: HttpContext) {
    try {
      // For now, return empty array as this method doesn't exist yet
      const suggestions: string[] = []
      
      return response.ok({
        success: true,
        data: suggestions,
        message: 'Search suggestions retrieved successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve search suggestions'
      })
    }
  }

  async getStats({ auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const stats = await JournalService.getJournalStats(userId)
      
      return response.ok({
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve user statistics'
      })
    }
  }

  async show({ params, auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const entry = await JournalService.getEntryById(userId, params.id)
      
      if (!entry) {
        return response.notFound({
          success: false,
          message: 'Journal entry not found'
        })
      }
      
      return response.ok({
        success: true,
        data: entry,
        message: 'Journal entry retrieved successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve journal entry'
      })
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const data = request.body()
      const entry = await JournalService.updateEntry(userId, params.id, data)
      
      if (!entry) {
        return response.notFound({
          success: false,
          message: 'Journal entry not found'
        })
      }
      
      return response.ok({
        success: true,
        data: entry,
        message: 'Journal entry updated successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to update journal entry'
      })
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const deleted = await JournalService.deleteEntry(userId, params.id)
      
      if (!deleted) {
        return response.notFound({
          success: false,
          message: 'Journal entry not found'
        })
      }
      
      return response.ok({
        success: true,
        message: 'Journal entry deleted successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to delete journal entry'
      })
    }
  }
}

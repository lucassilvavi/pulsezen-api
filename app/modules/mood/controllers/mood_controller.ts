import type { HttpContext } from '@adonisjs/core/http'
import { MoodService } from '../services/mood_service.js'
import { 
  createMoodEntryValidator, 
  updateMoodEntryValidator,
  moodStatsQueryValidator,
  moodEntriesQueryValidator
} from '../validators/mood_validator.js'
import MoodEntry from '../../../models/mood_entry.js'
import { StructuredLogger } from '../../../services/structured_logger.js'
import type { MoodLevel, MoodPeriod } from '../../../types/mood_types.js'

export default class MoodController {
  /**
   * POST /mood/entries - Create a new mood entry
   */
  async store({ auth, request, response }: HttpContext) {
    try {
     
      // Validate request data
      const data = await request.validateUsing(createMoodEntryValidator)
      
      // Auto-detect current period if not provided
      const period = data.period || MoodService.getCurrentPeriod()
      
      // Use today's date if not provided
      const date = data.date || new Date().toISOString().split('T')[0]
      
      // Default mood level if not provided (should not happen in production)
      if (!data.mood_level) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'mood_level é obrigatório'
        })
      }

      // Create mood entry
      const result = await MoodService.createMoodEntry({
        userId: auth.userId,
        moodLevel: data.mood_level,
        period,
        date,
        timestamp: Date.now(),
        notes: data.notes,
        activities: data.activities,
        emotions: data.emotions
      })

      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: 'Creation failed',
          message: result.message
        })
      }

      StructuredLogger.info('Mood entry created via API', {
        userId: auth.userId,
        entryId: result.entry?.id,
        moodLevel: data.mood_level,
        period
      })

      // 🔮 Regenerar predição automaticamente após criar entrada de mood
      setImmediate(async () => {
        try {
          const CrisisPredictionController = (await import('#controllers/CrisisPredictionController')).default
          await CrisisPredictionController.generatePredictionForUser(auth.userId)
          
          StructuredLogger.info('✅ Predição regenerada automaticamente após mood entry', {
            userId: auth.userId,
            entryId: result.entry?.id
          })
        } catch (error) {
          StructuredLogger.error('Erro ao regenerar predição após mood entry', {
            userId: auth.userId,
            error: error.message
          })
        }
      })

      return response.status(201).json({
        success: true,
        data: {
          id: result.entry!.id,
          user_id: result.entry!.userId,
          mood_level: result.entry!.moodLevel,
          period: result.entry!.period,
          date: result.entry!.date.toISODate(),
          timestamp: result.entry!.timestamp,
          notes: result.entry!.notes,
          activities: result.entry!.activities,
          emotions: result.entry!.emotions,
          created_at: result.entry!.createdAt.toISO(),
          updated_at: result.entry!.updatedAt.toISO()
        },
        message: result.message
      })
    } catch (error) {
      StructuredLogger.error('Error creating mood entry via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /mood/entries - List mood entries with filters
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      // Validate query parameters
      const query = await request.validateUsing(moodEntriesQueryValidator)
      
      // Build filters
      const filters = {
        date: query.date,
        period: query.period,
        moodLevel: query.mood_level,
        startDate: query.start_date,
        endDate: query.end_date,
        limit: query.limit || 50, // Default limit
        offset: query.offset || 0
      }

      const entries = await MoodService.getMoodEntries(auth.userId, filters)

      // Transform entries for API response
      const transformedEntries = entries.map(entry => ({
        id: entry.id,
        user_id: entry.userId,
        mood_level: entry.moodLevel,
        period: entry.period,
        date: entry.date.toISODate(),
        timestamp: entry.timestamp,
        notes: entry.notes,
        activities: entry.activities,
        emotions: entry.emotions,
        created_at: entry.createdAt.toISO(),
        updated_at: entry.updatedAt.toISO()
      }))

      StructuredLogger.info('Mood entries retrieved via API', {
        userId: auth.userId,
        count: entries.length,
        filters
      })

      return response.status(200).json({
        success: true,
        data: transformedEntries,
        meta: {
          count: entries.length,
          limit: filters.limit,
          offset: filters.offset
        }
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving mood entries via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /mood/entries/:id - Get specific mood entry
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const entry = await MoodEntry.query()
        .where('id', params.id)
        .where('userId', auth.userId) // Ensure ownership
        .first()

      if (!entry) {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Entrada de humor não encontrada'
        })
      }

      return response.status(200).json({
        success: true,
        data: {
          id: entry.id,
          user_id: entry.userId,
          mood_level: entry.moodLevel,
          period: entry.period,
          date: entry.date.toISODate(),
          timestamp: entry.timestamp,
          notes: entry.notes,
          activities: entry.activities,
          emotions: entry.emotions,
          created_at: entry.createdAt.toISO(),
          updated_at: entry.updatedAt.toISO()
        }
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving mood entry via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * PUT /mood/entries/:id - Update mood entry
   */
  async update({ auth, params, request, response }: HttpContext) {
    try {
      // Find entry and verify ownership
      const entry = await MoodEntry.query()
        .where('id', params.id)
        .where('userId', auth.userId)
        .first()

      if (!entry) {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Entrada de humor não encontrada'
        })
      }

      // Check if entry is older than 24 hours
      const hoursSinceCreation = Math.abs(Date.now() - entry.timestamp) / (1000 * 60 * 60)
      if (hoursSinceCreation > 24) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Só é possível editar entradas criadas nas últimas 24 horas'
        })
      }

      // Validate request data
      const data = await request.validateUsing(updateMoodEntryValidator)

      // Update entry
      entry.merge({
        moodLevel: data.mood_level || entry.moodLevel,
        notes: data.notes !== undefined ? data.notes : entry.notes,
        activities: data.activities !== undefined ? data.activities : entry.activities,
        emotions: data.emotions !== undefined ? data.emotions : entry.emotions
      })

      await entry.save()

      StructuredLogger.info('Mood entry updated via API', {
        userId: auth.userId,
        entryId: entry.id,
        changes: data
      })

      return response.status(200).json({
        success: true,
        data: {
          id: entry.id,
          user_id: entry.userId,
          mood_level: entry.moodLevel,
          period: entry.period,
          date: entry.date.toISODate(),
          timestamp: entry.timestamp,
          notes: entry.notes,
          activities: entry.activities,
          emotions: entry.emotions,
          created_at: entry.createdAt.toISO(),
          updated_at: entry.updatedAt.toISO()
        },
        message: 'Entrada de humor atualizada com sucesso'
      })
    } catch (error) {
      StructuredLogger.error('Error updating mood entry via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * DELETE /mood/entries/:id - Delete mood entry
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      // Find entry and verify ownership
      const entry = await MoodEntry.query()
        .where('id', params.id)
        .where('userId', auth.userId)
        .first()

      if (!entry) {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Entrada de humor não encontrada'
        })
      }

      // Soft delete by setting deleted_at (if your model supports it)
      // For now, we'll do hard delete
      await entry.delete()

      StructuredLogger.info('Mood entry deleted via API', {
        userId: auth.userId,
        entryId: entry.id
      })

      return response.status(200).json({
        success: true,
        message: 'Entrada de humor removida com sucesso'
      })
    } catch (error) {
      StructuredLogger.error('Error deleting mood entry via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /mood/stats - Get mood statistics
   */
  async stats({ auth, request, response }: HttpContext) {
    try {
      // Validate query parameters
      const query = await request.validateUsing(moodStatsQueryValidator)
      
      const days = query.days || 7
      const stats = await MoodService.calculateMoodStats(auth.userId, days)

      StructuredLogger.info('Mood stats retrieved via API', {
        userId: auth.userId,
        days,
        totalEntries: stats.total_entries
      })

      return response.status(200).json({
        success: true,
        data: stats
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving mood stats via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /mood/trend - Get mood trend data
   */
  async trend({ auth, request, response }: HttpContext) {
    try {
      // Get days from query or default to 30
      const days = parseInt(request.input('days', '30'))
      
      if (days < 1 || days > 365) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'days deve estar entre 1 e 365'
        })
      }

      const trend = await MoodService.getMoodTrend(auth.userId, days)

      StructuredLogger.info('Mood trend retrieved via API', {
        userId: auth.userId,
        days,
        dataPoints: trend.length
      })

      return response.status(200).json({
        success: true,
        data: trend,
        meta: {
          days,
          data_points: trend.length
        }
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving mood trend via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * GET /mood/validate/:period - Validate if user can create entry for period
   */
  async validatePeriod({ auth, params, request, response }: HttpContext) {
    try {
      const period = params.period as MoodPeriod
      const date = request.input('date', new Date().toISOString().split('T')[0])

      // Validate period
      if (!['manha', 'tarde', 'noite'].includes(period)) {
        return response.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Período inválido. Use: manha, tarde ou noite'
        })
      }

      const canCreate = await MoodService.validatePeriodEntry(auth.userId, date, period)

      return response.status(200).json({
        success: true,
        data: {
          can_create: canCreate,
          period,
          date
        }
      })
    } catch (error) {
      StructuredLogger.error('Error validating mood period via API', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      })
    }
  }
}

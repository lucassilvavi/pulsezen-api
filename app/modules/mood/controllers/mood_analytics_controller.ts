import type { HttpContext } from '@adonisjs/core/http'
import { MoodAnalyticsService } from '../services/mood_analytics_service.js'
import { StructuredLogger } from '../../../services/structured_logger.js'

export default class MoodAnalyticsController {
  /**
   * Get positive mood streak for authenticated user
   * GET /api/v1/mood/analytics/positive-streak
   */
  async getPositiveStreak({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        })
      }

      const streak = await MoodAnalyticsService.calculatePositiveMoodStreak(user.userId)

      StructuredLogger.info('Retrieved positive mood streak', {
        userId: user.userId,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        isActive: streak.isActive
      })

      return response.ok({
        success: true,
        data: streak
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving positive mood streak', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Get period patterns for authenticated user
   * GET /api/v1/mood/analytics/period-patterns?days=30
   */
  async getPeriodPatterns({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        })
      }

      const days = request.input('days', 30)

      // Validate days parameter
      if (days < 1 || days > 365) {
        return response.badRequest({
          success: false,
          message: 'Dias deve estar entre 1 e 365'
        })
      }

      const patterns = await MoodAnalyticsService.analyzePeriodPatterns(user.userId, days)

      StructuredLogger.info('Retrieved period patterns', {
        userId: user.userId,
        days,
        bestPeriod: patterns.bestPeriod,
        consistency: patterns.consistency
      })

      return response.ok({
        success: true,
        data: patterns
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving period patterns', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Get weekly trends for authenticated user
   * GET /api/v1/mood/analytics/weekly-trends?weeks=8
   */
  async getWeeklyTrends({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        })
      }

      const weeks = request.input('weeks', 8)

      // Validate weeks parameter
      if (weeks < 1 || weeks > 52) {
        return response.badRequest({
          success: false,
          message: 'Semanas deve estar entre 1 e 52'
        })
      }

      const trends = await MoodAnalyticsService.analyzeWeeklyTrends(user.userId, weeks)

      StructuredLogger.info('Retrieved weekly trends', {
        userId: user.userId,
        weeks,
        trendDirection: trends.trendDirection,
        volatility: trends.volatility
      })

      return response.ok({
        success: true,
        data: trends
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving weekly trends', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Get personalized insights for authenticated user
   * GET /api/v1/mood/analytics/insights
   */
  async getInsights({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        })
      }

      const insights = await MoodAnalyticsService.generateInsights(user.userId)

      StructuredLogger.info('Retrieved mood insights', {
        userId: user.userId,
        insightCount: insights.length,
        insightTypes: insights.map(i => i.type)
      })

      return response.ok({
        success: true,
        data: insights
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving mood insights', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Get mood correlations for authenticated user
   * GET /api/v1/mood/analytics/correlations
   */
  async getCorrelations({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        })
      }

      const correlations = await MoodAnalyticsService.getMoodCorrelations(user.userId)

      StructuredLogger.info('Retrieved mood correlations', {
        userId: user.userId,
        correlationCount: correlations.length
      })

      return response.ok({
        success: true,
        data: correlations
      })
    } catch (error) {
      StructuredLogger.error('Error retrieving mood correlations', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   * GET /api/v1/mood/analytics/dashboard
   */
  async getDashboard({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        })
      }

      const days = request.input('days', 30)
      const weeks = request.input('weeks', 8)

      // Validate parameters
      if (days < 1 || days > 365 || weeks < 1 || weeks > 52) {
        return response.badRequest({
          success: false,
          message: 'Parâmetros inválidos'
        })
      }

      // Get all analytics in parallel for dashboard
      const [positiveStreak, periodPatterns, weeklyTrends, insights, correlations] = await Promise.all([
        MoodAnalyticsService.calculatePositiveMoodStreak(user.userId),
        MoodAnalyticsService.analyzePeriodPatterns(user.userId, days),
        MoodAnalyticsService.analyzeWeeklyTrends(user.userId, weeks),
        MoodAnalyticsService.generateInsights(user.userId),
        MoodAnalyticsService.getMoodCorrelations(user.userId)
      ])

      const dashboardData = {
        positiveStreak,
        periodPatterns,
        weeklyTrends,
        insights,
        correlations,
        metadata: {
          generatedAt: new Date().toISOString(),
          parameters: { days, weeks }
        }
      }

      StructuredLogger.info('Generated analytics dashboard', {
        userId: user.userId,
        days,
        weeks,
        insightCount: insights.length
      })

      return response.ok({
        success: true,
        data: dashboardData
      })
    } catch (error) {
      StructuredLogger.error('Error generating analytics dashboard', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }
}

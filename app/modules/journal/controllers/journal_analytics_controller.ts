import type { HttpContext } from '@adonisjs/core/http'
import { JournalAnalyticsService } from '../services/journal_analytics_service.js'

export default class JournalAnalyticsController {
  
  /**
   * GET /api/v1/journal/analytics
   * Retorna analytics completos do journal do usuário
   */
  async getJournalAnalytics({ auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const analytics = await JournalAnalyticsService.getCompleteAnalytics(userId)
      
      return response.ok({
        success: true,
        data: analytics,
        message: 'Journal analytics retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting journal analytics:', error)
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve journal analytics'
      })
    }
  }

  /**
   * GET /api/v1/journal/analytics/timeline
   * Retorna dados da timeline de humor dos últimos 7 dias
   */
  async getTimelineData({ auth, request, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const days = parseInt(request.qs().days) || 7
      
      const timelineData = await JournalAnalyticsService.getTimelineData(userId, days)
      
      return response.ok({
        success: true,
        data: timelineData,
        message: 'Timeline data retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting timeline data:', error)
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve timeline data'
      })
    }
  }

  /**
   * GET /api/v1/journal/analytics/mood-distribution
   * Retorna distribuição detalhada de humores
   */
  async getMoodDistribution({ auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const distribution = await JournalAnalyticsService.getMoodDistribution(userId)
      
      return response.ok({
        success: true,
        data: distribution,
        message: 'Mood distribution retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting mood distribution:', error)
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve mood distribution'
      })
    }
  }

  /**
   * GET /api/v1/journal/analytics/streak
   * Retorna informações detalhadas sobre streak de escrita
   */
  async getStreakData({ auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const streakData = await JournalAnalyticsService.getStreakData(userId)
      
      return response.ok({
        success: true,
        data: streakData,
        message: 'Streak data retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting streak data:', error)
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to retrieve streak data'
      })
    }
  }

  /**
   * GET /api/v1/journal/analytics/report
   * Gera e retorna relatório HTML para profissionais de saúde mental
   */
  async generateTherapeuticReport({ auth, response }: HttpContext) {
    try {
      const userId = auth!.userId
      const htmlContent = await JournalAnalyticsService.generateTherapeuticReport(userId)
      
      // Retornar HTML por enquanto (mais fácil para teste)
      response.header('Content-Type', 'text/html; charset=utf-8')
      response.header('Content-Disposition', 'inline; filename="relatorio-terapeutico.html"')
      
      return response.send(htmlContent)
    } catch (error) {
      console.error('Error generating therapeutic report:', error)
      return response.badRequest({
        success: false,
        error: error.message,
        message: 'Failed to generate therapeutic report'
      })
    }
  }
}
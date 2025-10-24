/**
 * Crisis Prediction Controller - API endpoints para predição de crises
 */

import type { HttpContext } from '@adonisjs/core/http'
import { CrisisPredictionEngine } from '../services/CrisisPredictionEngine.js'
import type { PredictionInputData } from '../types/crisis_prediction_types.js'
import Database from '@adonisjs/lucid/services/db'

export default class CrisisPredictionController {
  private predictionEngine: CrisisPredictionEngine

  constructor() {
    this.predictionEngine = new CrisisPredictionEngine()
  }

  /**
   * Gerar nova predição de crise para o usuário
   * POST /api/crisis/predict
   */
  async predict({ auth, request, response }: HttpContext) {
    try {
      const userId = auth?.userId
      if (!userId) {
        return response.unauthorized({ error: 'Usuário não autenticado' })
      }

      const { analysisWindow } = request.only(['analysisWindow'])
      const windowDays = analysisWindow?.days || 14 // Default: 2 semanas

      // Coletar dados para análise
      const inputData = await this.collectUserData(userId, windowDays)

      // Gerar predição
      const prediction = await this.predictionEngine.predict(inputData)

      // Salvar predição no banco
      await this.savePrediction(prediction)

      return response.ok({
        success: true,
        data: prediction,
        message: 'Predição gerada com sucesso'
      })

    } catch (error) {
      console.error('Erro ao gerar predição:', error)
      
      return response.badRequest({
        success: false,
        error: error.message || 'Erro interno do servidor',
        code: 'PREDICTION_ERROR'
      })
    }
  }

  /**
   * Obter predição mais recente do usuário
   * GET /api/crisis/prediction/latest
   */
  async getLatest({ auth, response }: HttpContext) {
    try {
      console.log('🔍 Iniciando getLatest...')
      
      const userId = auth?.userId
      if (!userId) {
        console.log('❌ Usuário não autenticado')
        return response.unauthorized({ error: 'Usuário não autenticado' })
      }

      console.log('👤 User ID:', userId)

      const prediction = await Database
        .from('predictions')
        .where('user_id', userId)
        .where('expires_at', '>', new Date())
        .orderBy('created_at', 'desc')
        .first()

      console.log('📊 Prediction found:', prediction ? 'SIM' : 'NÃO')
      
      if (!prediction) {
        console.log('❌ Nenhuma predição encontrada')
        return response.notFound({
          success: false,
          message: 'Nenhuma predição válida encontrada'
        })
      }

      console.log('🔄 Parsing JSON fields...')
      console.log('Factors:', prediction.factors)
      console.log('Interventions:', prediction.interventions)

      // Parse JSON fields
      const parsedPrediction = {
        ...prediction,
        factors: prediction.factors ? JSON.parse(prediction.factors) : {},
        interventions: prediction.interventions ? JSON.parse(prediction.interventions) : [],
        previous_prediction: prediction.previous_prediction 
          ? JSON.parse(prediction.previous_prediction) 
          : null
      }

      console.log('✅ Retornando predição')
      return response.ok({
        success: true,
        data: parsedPrediction
      })

    } catch (error) {
      console.error('❌ Erro ao buscar predição:', error)
      
      return response.internalServerError({
        success: false,
        error: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Histórico de predições do usuário
   * GET /api/crisis/predictions/history
   */
  async getHistory({ auth, request, response }: HttpContext) {
    try {
      const userId = auth?.userId
      if (!userId) {
        return response.unauthorized({ error: 'Usuário não autenticado' })
      }

      const { page = 1, limit = 10 } = request.qs()

      const predictions = await Database
        .from('predictions')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      // Parse JSON fields
      const parsedPredictions = predictions.map(prediction => ({
        ...prediction,
        factors: prediction.factors ? JSON.parse(prediction.factors) : {},
        interventions: prediction.interventions ? JSON.parse(prediction.interventions) : [],
        previous_prediction: prediction.previous_prediction 
          ? JSON.parse(prediction.previous_prediction) 
          : null
      }))

      return response.ok({
        success: true,
        data: parsedPredictions,
        meta: {
          total: predictions.length,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      })

    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      
      return response.internalServerError({
        success: false,
        error: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Estatísticas de predições para dashboard
   * GET /api/crisis/stats
   */
  async getStats({ auth, response }: HttpContext) {
    try {
      const userId = auth?.userId
      if (!userId) {
        return response.unauthorized({ error: 'Usuário não autenticado' })
      }

      // Buscar predições dos últimos 30 dias
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const predictions = await Database
        .from('predictions')
        .where('user_id', userId)
        .where('created_at', '>=', thirtyDaysAgo)
        .orderBy('created_at', 'asc')

      // Calcular estatísticas
      const stats = {
        totalPredictions: predictions.length,
        riskDistribution: {
          low: predictions.filter(p => p.risk_level === 'low').length,
          medium: predictions.filter(p => p.risk_level === 'medium').length,
          high: predictions.filter(p => p.risk_level === 'high').length,
          critical: predictions.filter(p => p.risk_level === 'critical').length
        },
        averageRiskScore: predictions.length > 0 
          ? predictions.reduce((sum, p) => sum + p.risk_score, 0) / predictions.length
          : 0,
        averageConfidence: predictions.length > 0
          ? predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length
          : 0,
        trend: this.calculateRiskTrend(predictions),
        lastPrediction: predictions.length > 0 ? predictions[predictions.length - 1] : null
      }

      return response.ok({
        success: true,
        data: stats
      })

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
      
      return response.internalServerError({
        success: false,
        error: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Atualizar configuração do algoritmo (admin only)
   * PUT /api/crisis/config
   */
  async updateConfig({ auth, request, response }: HttpContext) {
    try {
      const userId = auth?.userId
      if (!userId) {
        return response.forbidden({ error: 'Acesso negado' })
      }

      const { weights, thresholds, analysisWindow } = request.only([
        'weights', 'thresholds', 'analysisWindow'
      ])

      // Validar configuração
      if (weights) {
        const totalWeight = Object.values(weights).reduce((sum: number, w: any) => sum + w, 0)
        if (Math.abs(totalWeight - 1.0) > 0.01) {
          return response.badRequest({
            error: 'Soma dos pesos deve ser 1.0'
          })
        }
      }

      // Atualizar configuração
      this.predictionEngine.updateConfig({
        weights,
        thresholds,
        analysisWindow
      })

      return response.ok({
        success: true,
        message: 'Configuração atualizada com sucesso',
        config: this.predictionEngine.getConfig()
      })

    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      
      return response.internalServerError({
        success: false,
        error: 'Erro interno do servidor'
      })
    }
  }

  // === MÉTODOS PRIVADOS ===

  /**
   * Coleta dados do usuário para análise
   */
  private async collectUserData(userId: string, windowDays: number): Promise<PredictionInputData> {
    // Data limite para análise
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - windowDays)

    // Buscar dados de journal
    const journalEntries = await Database
      .from('journal_entries')
      .where('user_id', userId)
      .where('created_at', '>=', startDate)
      .where('created_at', '<=', endDate)
      .orderBy('created_at', 'asc')

    // Buscar dados de mood
    const moodEntries = await Database
      .from('mood_entries')
      .where('user_id', userId)
      .where('created_at', '>=', startDate)
      .where('created_at', '<=', endDate)
      .orderBy('created_at', 'asc')

    return {
      userId,
      analysisWindow: {
        days: windowDays,
        endDate: endDate.toISOString()
      },
      moodEntries: moodEntries || [],
      journalEntries: journalEntries || []
    }
  }

  /**
   * Salva predição no banco de dados
   */
  private async savePrediction(prediction: any): Promise<void> {
    await Database
      .table('predictions')
      .insert({
        id: prediction.id,
        user_id: prediction.userId,
        risk_score: prediction.riskScore,
        risk_level: prediction.riskLevel,
        confidence_score: prediction.confidenceScore,
        factors: JSON.stringify(prediction.factors),
        interventions: JSON.stringify(prediction.interventions),
        algorithm_version: prediction.algorithmVersion,
        expires_at: prediction.expiresAt,
        created_at: prediction.createdAt,
        updated_at: prediction.updatedAt
      })
  }

  /**
   * Calcula tendência de risco baseada no histórico
   */
  private calculateRiskTrend(predictions: any[]): 'improving' | 'worsening' | 'stable' {
    if (predictions.length < 2) return 'stable'

    const recent = predictions.slice(-5) // Últimas 5 predições
    const earlier = predictions.slice(0, 5) // Primeiras 5 predições

    const recentAvg = recent.reduce((sum, p) => sum + p.risk_score, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, p) => sum + p.risk_score, 0) / earlier.length

    const difference = recentAvg - earlierAvg

    if (Math.abs(difference) < 0.05) return 'stable'
    return difference > 0 ? 'worsening' : 'improving'
  }
}

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
   * Auto-gera nova predição se não houver ou se última for > 12h
   */
  async getLatest({ auth, response }: HttpContext) {
    try {
      const userId = auth?.userId
      if (!userId) {
        return response.unauthorized({ error: 'Usuário não autenticado' })
      }

      const prediction = await Database
        .from('predictions')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .first()

      // Verificar se precisa gerar nova predição (cache de 12 horas)
      const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000
      const timeDiff = prediction ? new Date().getTime() - new Date(prediction.created_at).getTime() : Infinity
      const needsNewPrediction = !prediction || timeDiff > TWELVE_HOURS_MS

      if (needsNewPrediction) {
        // Gerar nova predição automaticamente
        try {
          const inputData = await this.collectUserData(userId, 14)
          const newPrediction = await this.predictionEngine.predict(inputData)
          await this.savePrediction(newPrediction)

          return response.ok({
            success: true,
            data: newPrediction,
            message: 'Nova predição gerada automaticamente'
          })
        } catch (error) {
          // Se falhar ao gerar, retornar a última disponível (se existir)
          if (prediction) {
            const parsedPrediction = {
              ...prediction,
              factors: prediction.factors || {},
              interventions: prediction.interventions || [],
              previous_prediction: prediction.previous_prediction || null
            }
            return response.ok({
              success: true,
              data: parsedPrediction,
              message: 'Predição anterior (falha ao gerar nova)'
            })
          }
          throw error
        }
      }

      // Retornar predição recente existente
      const parsedPrediction = {
        ...prediction,
        factors: prediction.factors || {},
        interventions: prediction.interventions || [],
        previous_prediction: prediction.previous_prediction || null
      }

      return response.ok({
        success: true,
        data: parsedPrediction
      })

    } catch (error) {
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

      // JSONB fields são retornados automaticamente como objetos pelo PostgreSQL
      const parsedPredictions = predictions.map(prediction => ({
        ...prediction,
        factors: prediction.factors || {},
        interventions: prediction.interventions || [],
        previous_prediction: prediction.previous_prediction || null
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
   * Método público para gerar predição de qualquer lugar
   * Usado por MoodController e JournalController após criar entradas
   */
  static async generatePredictionForUser(userId: string): Promise<void> {
    try {
      const controller = new CrisisPredictionController()
      const inputData = await controller.collectUserData(userId, 14)
      const prediction = await controller.predictionEngine.predict(inputData)
      await controller.savePrediction(prediction)
    } catch (error) {
      // Falha silenciosa - não quebrar o fluxo principal se predição falhar
      console.error('Erro ao gerar predição automática:', error.message)
    }
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

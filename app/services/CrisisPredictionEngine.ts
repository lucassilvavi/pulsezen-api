/**
 * Crisis Prediction Engine™ - Algoritmo Principal
 * Implementação avançada de predição de crises de ansiedade
 * Baseado em análise de humor, sentiment analysis e padrões comportamentais
 */

import { randomUUID } from 'crypto'
import { 
  CrisisPrediction, 
  PredictionInputData, 
  PredictionFactor, 
  CrisisRiskLevel,
  PredictionConfig,
  CrisisIntervention,
  DEFAULT_PREDICTION_CONFIG,
  CRISIS_DEFINITIONS,
  CRISIS_INTERVENTIONS,
  PredictionFactorType
} from '../types/crisis_prediction_types.js'

export class CrisisPredictionEngine {
  private config: PredictionConfig
  private version: string = '1.0.0'

  constructor(config?: Partial<PredictionConfig>) {
    this.config = { ...DEFAULT_PREDICTION_CONFIG, ...config }
  }

  /**
   * MÉTODO PRINCIPAL: Gera predição de crise baseada nos dados de entrada
   */
  async predict(inputData: PredictionInputData): Promise<CrisisPrediction> {
    try {
      // Validação dos dados de entrada
      this.validateInputData(inputData)

      // Análise dos fatores de risco
      const factors = await this.analyzeRiskFactors(inputData)
      
      // Cálculo do score de risco (0.000 - 1.000)
      const riskScore = this.calculateRiskScore(factors)
      
      // Determinação do nível de risco
      const riskLevel = this.determineRiskLevel(riskScore)
      
      // Cálculo de confiança do algoritmo
      const confidenceScore = this.calculateConfidenceScore(inputData, factors)
      
      // Seleção de intervenções apropriadas
      const interventions = this.selectInterventions(factors, riskLevel)
      
      // Comparação com predição anterior (se existir)
      const previousPrediction = await this.getPreviousPrediction(inputData.userId)

      const prediction: CrisisPrediction = {
        id: randomUUID(),  // Gera UUID válido para o banco
        userId: inputData.userId,
        riskScore: Math.max(0.000, Math.min(1.000, Number(riskScore.toFixed(3)))),
        riskLevel,
        confidenceScore: Math.max(0.300, Math.min(1.000, Number(confidenceScore.toFixed(3)))),
        factors,
        interventions,
        algorithmVersion: this.version,
        dataPointsAnalyzed: inputData.moodEntries.length + inputData.journalEntries.length,
        analysisWindow: {
          startDate: this.getAnalysisStartDate(inputData),
          endDate: inputData.analysisWindow.endDate || new Date().toISOString(),
          days: inputData.analysisWindow.days
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        nextUpdateAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6h
        previousPrediction: previousPrediction ? {
          riskScore: previousPrediction.riskScore,
          riskLevel: previousPrediction.riskLevel,
          trend: this.calculateTrend(previousPrediction.riskScore, riskScore)
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return prediction
    } catch (error) {
      throw new Error(`Crisis Prediction Engine Error: ${error.message}`)
    }
  }

  /**
   * Análise detalhada dos fatores de risco
   */
  private async analyzeRiskFactors(inputData: PredictionInputData): Promise<PredictionFactor[]> {
    const factors: PredictionFactor[] = []

    // 1. ANÁLISE DE HUMOR (30% peso)
    const moodFactor = this.analyzeMoodFactor(inputData.moodEntries)
    factors.push(moodFactor)

    // 2. ANÁLISE DE SENTIMENT (25% peso)
    const sentimentFactor = this.analyzeSentimentFactor(inputData.journalEntries)
    factors.push(sentimentFactor)

    // 3. ANÁLISE DE PALAVRAS-CHAVE DE STRESS (20% peso)
    const stressKeywordFactor = this.analyzeStressKeywords(inputData.journalEntries)
    factors.push(stressKeywordFactor)

    // 4. ANÁLISE DE FREQUÊNCIA DE JOURNAL (15% peso)
    const frequencyFactor = this.analyzeJournalFrequency(inputData.journalEntries, inputData.analysisWindow.days)
    factors.push(frequencyFactor)

    // 5. ANÁLISE DE TENDÊNCIA TEMPORAL (10% peso)
    const trendFactor = this.analyzeTrend(inputData.moodEntries, inputData.journalEntries)
    factors.push(trendFactor)

    return factors
  }

  /**
   * Análise do fator de humor baseado nas entradas de mood
   */
  private analyzeMoodFactor(moodEntries: any[]): PredictionFactor {
    if (moodEntries.length === 0) {
      return {
        type: 'mood_decline',
        weight: this.config.weights.moodWeight,
        currentValue: 0,
        threshold: 2.5,
        trend: 'stable',
        description: 'Sem dados de humor disponíveis'
      }
    }

    // Converter mood levels para valores numéricos
    // Nota: Database.from() retorna campos em snake_case
    const moodValues = moodEntries.map(entry => 
      this.moodLevelToNumber(entry.mood_level ?? entry.moodLevel)
    )
    const averageMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length

    // Análise de tendência nos últimos 7 dias vs primeiros 7 dias
    const recentMoods = moodValues.slice(-7)
    const earlierMoods = moodValues.slice(0, 7)
    const recentAvg = recentMoods.reduce((sum, val) => sum + val, 0) / recentMoods.length
    const earlierAvg = earlierMoods.reduce((sum, val) => sum + val, 0) / earlierMoods.length

    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentAvg > earlierAvg + 0.3) trend = 'improving'
    else if (recentAvg < earlierAvg - 0.3) trend = 'declining'

    return {
      type: 'mood_decline',
      weight: this.config.weights.moodWeight,
      currentValue: Number(averageMood.toFixed(2)),
      threshold: 2.5, // Abaixo de 2.5 é preocupante
      trend,
      description: `Humor médio: ${averageMood.toFixed(1)}/5.0 (${moodEntries.length} entradas)`
    }
  }

  /**
   * Análise do fator de sentiment baseado no journal
   */
  private analyzeSentimentFactor(journalEntries: any[]): PredictionFactor {
    if (journalEntries.length === 0) {
      return {
        type: 'negative_sentiment',
        weight: this.config.weights.sentimentWeight,
        currentValue: 0,
        threshold: -0.3,
        trend: 'stable',
        description: 'Sem entradas de journal para análise de sentiment'
      }
    }

    // Calcular sentiment médio (ignorar valores null)
    // Nota: Database.from() retorna campos em snake_case
    const validSentiments = journalEntries
      .filter(entry => {
        const score = entry.sentiment_score ?? entry.sentimentScore
        return score !== null && score !== undefined
      })
      .map(entry => entry.sentiment_score ?? entry.sentimentScore)

    if (validSentiments.length === 0) {
      return {
        type: 'negative_sentiment',
        weight: this.config.weights.sentimentWeight,
        currentValue: 0,
        threshold: -0.3,
        trend: 'stable',
        description: 'Sentiment não calculado para entradas de journal'
      }
    }

    const averageSentiment = validSentiments.reduce((sum, val) => sum + val, 0) / validSentiments.length

    // Análise de tendência
    const recentSentiments = validSentiments.slice(-5)
    const earlierSentiments = validSentiments.slice(0, 5)
    const recentAvg = recentSentiments.reduce((sum, val) => sum + val, 0) / recentSentiments.length
    const earlierAvg = earlierSentiments.reduce((sum, val) => sum + val, 0) / earlierSentiments.length

    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentAvg > earlierAvg + 0.1) trend = 'improving'
    else if (recentAvg < earlierAvg - 0.1) trend = 'declining'

    return {
      type: 'negative_sentiment',
      weight: this.config.weights.sentimentWeight,
      currentValue: Number(averageSentiment.toFixed(3)),
      threshold: -0.3, // Abaixo de -0.3 é negativo
      trend,
      description: `Sentiment médio: ${averageSentiment.toFixed(2)} (${validSentiments.length} entradas)`
    }
  }

  /**
   * Análise de palavras-chave de stress no conteúdo do journal
   */
  private analyzeStressKeywords(journalEntries: any[]): PredictionFactor {
    const stressKeywords = [
      // Ansiedade
      'ansiedade', 'ansioso', 'ansiosa', 'preocupado', 'preocupada', 'nervoso', 'nervosa',
      'tenso', 'tensa', 'estresse', 'stress', 'estressado', 'estressada',
      
      // Sintomas físicos
      'coração acelerado', 'palpitação', 'falta de ar', 'sufocado', 'tremor', 'suor',
      'tontura', 'náusea', 'insônia', 'não consegui dormir',
      
      // Estados emocionais
      'pânico', 'medo', 'terror', 'desespero', 'desespero', 'desesperada',
      'sobrevivir', 'aguentar', 'não aguento', 'cansado', 'cansada', 'exausto', 'exausta',
      
      // Pensamentos negativos
      'fracasso', 'inútil', 'burro', 'burra', 'sem valor', 'não sirvo',
      'tudo está errado', 'não vai dar certo', 'vou falhar'
    ]

    if (journalEntries.length === 0) {
      return {
        type: 'stress_keywords',
        weight: this.config.weights.stressKeywordWeight,
        currentValue: 0,
        threshold: 3,
        trend: 'stable',
        description: 'Sem entradas de journal para análise de palavras-chave'
      }
    }

    // Contar palavras-chave em todo o conteúdo
    let totalKeywords = 0
    const keywordCounts: { [key: string]: number } = {}

    journalEntries.forEach(entry => {
      const content = entry.content.toLowerCase()
      stressKeywords.forEach(keyword => {
        const matches = (content.match(new RegExp(keyword, 'g')) || []).length
        if (matches > 0) {
          totalKeywords += matches
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + matches
        }
      })
    })

    const averageKeywordsPerEntry = totalKeywords / journalEntries.length

    // Análise de tendência: comparar primeira vs segunda metade das entradas
    const firstHalf = journalEntries.slice(0, Math.floor(journalEntries.length / 2))
    const secondHalf = journalEntries.slice(Math.floor(journalEntries.length / 2))

    let firstHalfKeywords = 0
    let secondHalfKeywords = 0

    firstHalf.forEach(entry => {
      const content = entry.content.toLowerCase()
      stressKeywords.forEach(keyword => {
        firstHalfKeywords += (content.match(new RegExp(keyword, 'g')) || []).length
      })
    })

    secondHalf.forEach(entry => {
      const content = entry.content.toLowerCase()
      stressKeywords.forEach(keyword => {
        secondHalfKeywords += (content.match(new RegExp(keyword, 'g')) || []).length
      })
    })

    const firstHalfAvg = firstHalfKeywords / Math.max(firstHalf.length, 1)
    const secondHalfAvg = secondHalfKeywords / Math.max(secondHalf.length, 1)

    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (secondHalfAvg > firstHalfAvg + 0.5) trend = 'declining'
    else if (secondHalfAvg < firstHalfAvg - 0.5) trend = 'improving'

    return {
      type: 'stress_keywords',
      weight: this.config.weights.stressKeywordWeight,
      currentValue: Number(averageKeywordsPerEntry.toFixed(2)),
      threshold: 3, // Mais de 3 palavras-chave por entrada é preocupante
      trend,
      description: `${totalKeywords} palavras-chave de stress encontradas (${averageKeywordsPerEntry.toFixed(1)} por entrada)`
    }
  }

  /**
   * Análise da frequência de entradas de journal
   */
  private analyzeJournalFrequency(journalEntries: any[], windowDays: number): PredictionFactor {
    const entriesPerDay = journalEntries.length / windowDays
    const expectedFrequency = 0.5 // Esperado: pelo menos 1 entrada a cada 2 dias

    // Calcular distribuição temporal
    const entriesByDate: { [key: string]: number } = {}
    journalEntries.forEach(entry => {
      if (entry.createdAt) {  // Verificação de segurança
        const date = entry.createdAt.split('T')[0]
        entriesByDate[date] = (entriesByDate[date] || 0) + 1
      }
    })

    const daysWithEntries = Object.keys(entriesByDate).length
    const activeDaysRatio = daysWithEntries / windowDays

    // Análise de tendência: primeiros 7 vs últimos 7 dias
    const now = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    })

    const first7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - windowDays + i)
      return date.toISOString().split('T')[0]
    })

    const recentEntries = last7Days.reduce((sum, date) => sum + (entriesByDate[date] || 0), 0)
    const earlierEntries = first7Days.reduce((sum, date) => sum + (entriesByDate[date] || 0), 0)

    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentEntries > earlierEntries + 2) trend = 'improving'
    else if (recentEntries < earlierEntries - 2) trend = 'declining'

    return {
      type: 'journal_frequency',
      weight: this.config.weights.frequencyWeight,
      currentValue: Number(entriesPerDay.toFixed(2)),
      threshold: expectedFrequency,
      trend,
      description: `${journalEntries.length} entradas em ${windowDays} dias (${daysWithEntries} dias ativos)`
    }
  }

  /**
   * Análise de tendência temporal geral
   */
  private analyzeTrend(moodEntries: any[], journalEntries: any[]): PredictionFactor {
    // Combinar dados de humor e journal para análise temporal
    const timePoints: Array<{ date: string, mood?: number, sentiment?: number }> = []

    // Adicionar pontos de humor
    moodEntries.forEach(entry => {
      const timestamp = typeof entry.timestamp === 'string' ? parseInt(entry.timestamp) : entry.timestamp
      const date = new Date(timestamp).toISOString().split('T')[0]
      const existingPoint = timePoints.find(p => p.date === date)
      const moodLevel = entry.mood_level ?? entry.moodLevel
      if (existingPoint) {
        existingPoint.mood = this.moodLevelToNumber(moodLevel)
      } else {
        timePoints.push({ date, mood: this.moodLevelToNumber(moodLevel) })
      }
    })

    // Adicionar pontos de sentiment
    journalEntries.forEach(entry => {
      if (entry.createdAt) {  // Verificação de segurança
        const date = entry.createdAt.split('T')[0]
        const existingPoint = timePoints.find(p => p.date === date)
        const sentimentScore = entry.sentiment_score ?? entry.sentimentScore
        if (existingPoint) {
          existingPoint.sentiment = sentimentScore
        } else {
          timePoints.push({ date, sentiment: sentimentScore })
        }
      }
    })

    // Ordenar por data
    timePoints.sort((a, b) => a.date.localeCompare(b.date))

    if (timePoints.length < 3) {
      return {
        type: 'mood_decline',
        weight: this.config.weights.trendWeight,
        currentValue: 0,
        threshold: -0.1,
        trend: 'stable',
        description: 'Dados insuficientes para análise de tendência'
      }
    }

    // Calcular regressão linear simples para detectar tendência
    const trendScore = this.calculateLinearTrend(timePoints)

    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (trendScore > 0.1) trend = 'improving'
    else if (trendScore < -0.1) trend = 'declining'

    return {
      type: 'mood_decline',
      weight: this.config.weights.trendWeight,
      currentValue: Number(trendScore.toFixed(3)),
      threshold: -0.1, // Tendência negativa é preocupante
      trend,
      description: `Tendência temporal: ${trendScore > 0 ? 'melhora' : trendScore < 0 ? 'piora' : 'estável'}`
    }
  }

  /**
   * Calcula o score de risco baseado nos fatores analisados
   */
  private calculateRiskScore(factors: PredictionFactor[]): number {
    let weightedScore = 0
    let totalWeight = 0

    factors.forEach(factor => {
      let factorScore = 0

      // Calcular score do fator baseado no tipo
      switch (factor.type) {
        case 'mood_decline':
          // Mood: valor baixo = alto risco (inverso)
          // Normalizar: 5.0 = 0 risco, 1.0 = 1.0 risco
          factorScore = Math.max(0, (5.0 - factor.currentValue) / 4.0)
          break

        case 'negative_sentiment':
          // Sentiment: valor negativo = alto risco
          // Normalizar: 1.0 = 0 risco, -1.0 = 1.0 risco
          factorScore = Math.max(0, Math.min(1, (-factor.currentValue + 1) / 2))
          break

        case 'stress_keywords':
          // Palavras-chave: mais palavras = maior risco
          // Normalizar: 0 = 0 risco, 10+ = 1.0 risco
          factorScore = Math.min(1, factor.currentValue / 10)
          break

        case 'journal_frequency':
          // Frequência: baixa frequência = maior risco (se muito baixa)
          if (factor.currentValue < factor.threshold) {
            factorScore = (factor.threshold - factor.currentValue) / factor.threshold
          } else {
            factorScore = 0 // Frequência normal ou alta = baixo risco
          }
          break

        default:
          // Para outros fatores, usar comparação com threshold
          if (factor.currentValue > factor.threshold) {
            factorScore = Math.min(1, (factor.currentValue - factor.threshold) / factor.threshold)
          }
      }

      // Ajustar baseado na tendência
      if (factor.trend === 'declining') factorScore *= 1.2
      else if (factor.trend === 'improving') factorScore *= 0.8

      weightedScore += factorScore * factor.weight
      totalWeight += factor.weight
    })

    const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0
    const validScore = isNaN(finalScore) ? 0.1 : finalScore
    return Math.max(0.000, Math.min(1.000, validScore))
  }

  /**
   * Determina o nível de risco baseado no score
   */
  private determineRiskLevel(riskScore: number): CrisisRiskLevel {
    if (riskScore >= this.config.thresholds.criticalRisk) return 'critical'
    if (riskScore >= this.config.thresholds.highRisk) return 'high'
    if (riskScore >= this.config.thresholds.mediumRisk) return 'medium'
    return 'low'
  }

  /**
   * Calcula a confiança do algoritmo baseada na qualidade dos dados
   */
  private calculateConfidenceScore(inputData: PredictionInputData, factors: PredictionFactor[]): number {
    let confidenceFactors = 0
    let maxConfidence = 0

    // Fator 1: Quantidade de dados (25%)
    const totalDataPoints = inputData.moodEntries.length + inputData.journalEntries.length
    const dataConfidence = Math.min(1, totalDataPoints / 20) * 0.25
    confidenceFactors += dataConfidence
    maxConfidence += 0.25

    // Fator 2: Distribuição temporal (25%)
    const timeSpan = inputData.analysisWindow.days
    const timeConfidence = Math.min(1, timeSpan / 14) * 0.25
    confidenceFactors += timeConfidence
    maxConfidence += 0.25

    // Fator 3: Qualidade dos dados de sentiment (25%)
    const journalWithSentiment = inputData.journalEntries.filter(e => e.sentimentScore !== null).length
    const sentimentConfidence = inputData.journalEntries.length > 0 
      ? (journalWithSentiment / inputData.journalEntries.length) * 0.25
      : 0
    confidenceFactors += sentimentConfidence
    maxConfidence += 0.25

    // Fator 4: Consistência dos fatores (25%)
    const factorVariance = this.calculateFactorConsistency(factors)
    const consistencyConfidence = (1 - factorVariance) * 0.25
    confidenceFactors += consistencyConfidence
    maxConfidence += 0.25

    // Garantir um valor válido (temporário para debug)
    const finalConfidence = maxConfidence > 0 ? confidenceFactors / maxConfidence : 0.3
    const finalResult = isNaN(finalConfidence) ? 0.5 : finalConfidence
    return Math.max(0.300, Math.min(1.000, finalResult)) // Garantir entre 0.3 e 1.0
  }

  /**
   * Seleciona intervenções apropriadas baseadas nos fatores de risco
   */
  private selectInterventions(factors: PredictionFactor[], riskLevel: CrisisRiskLevel): CrisisIntervention[] {
    const selectedInterventions: CrisisIntervention[] = []
    const factorTypes = factors.map(f => f.type)

    // Selecionar baseado no nível de risco
    const availableInterventions = CRISIS_INTERVENTIONS.filter(intervention => {
      switch (riskLevel) {
        case 'critical':
          return intervention.priority === 'immediate'
        case 'high':
          return ['immediate', 'urgent'].includes(intervention.priority)
        case 'medium':
          return ['urgent', 'moderate'].includes(intervention.priority)
        case 'low':
          return ['moderate', 'preventive'].includes(intervention.priority)
        default:
          return false
      }
    })

    // Filtrar por fatores de trigger relevantes
    availableInterventions.forEach(intervention => {
      const hasRelevantTrigger = intervention.triggers.some(trigger => 
        factorTypes.includes(trigger)
      )
      
      if (hasRelevantTrigger || riskLevel === 'critical') {
        selectedInterventions.push(intervention)
      }
    })

    // Garantir pelo menos uma intervenção
    if (selectedInterventions.length === 0 && availableInterventions.length > 0) {
      selectedInterventions.push(availableInterventions[0])
    }

    // Limitar a 3 intervenções máximo
    return selectedInterventions.slice(0, 3)
  }

  // === MÉTODOS AUXILIARES ===

  private moodLevelToNumber(moodLevel: string): number {
    const moodMap: { [key: string]: number } = {
      'pessimo': 1,
      'mal': 2,
      'neutro': 3,
      'bem': 4,
      'excelente': 5,
      // Mantém compatibilidade com formato antigo
      'muito_ruim': 1,
      'ruim': 2,
      'bom': 4,
      'muito_bom': 5
    }
    return moodMap[moodLevel] || 3
  }

  private calculateLinearTrend(timePoints: Array<{ date: string, mood?: number, sentiment?: number }>): number {
    // Implementação simplificada de regressão linear
    const validPoints = timePoints.filter(p => p.mood !== undefined || p.sentiment !== undefined)
    if (validPoints.length < 3) return 0

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
    
    validPoints.forEach((point, index) => {
      const x = index
      const y = (point.mood || 3) + (point.sentiment || 0) * 2 // Combinar mood e sentiment
      
      sumX += x
      sumY += y
      sumXY += x * y
      sumXX += x * x
    })

    const n = validPoints.length
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    return slope || 0
  }

  private calculateFactorConsistency(factors: PredictionFactor[]): number {
    // Calcular variância entre os scores normalizados dos fatores
    const scores = factors.map(f => {
      switch (f.type) {
        case 'mood_decline':
          return Math.max(0, (5.0 - f.currentValue) / 4.0)
        case 'negative_sentiment':
          return Math.max(0, Math.min(1, (-f.currentValue + 1) / 2))
        case 'stress_keywords':
          return Math.min(1, f.currentValue / 10)
        default:
          return f.currentValue > f.threshold ? 1 : 0
      }
    })

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    
    return Math.min(1, variance)
  }

  private validateInputData(inputData: PredictionInputData): void {
    if (!inputData.userId) {
      throw new Error('userId é obrigatório')
    }

    if (!inputData.analysisWindow || !inputData.analysisWindow.days) {
      throw new Error('analysisWindow.days é obrigatório')
    }

    if (inputData.analysisWindow.days < 3) {
      throw new Error('Janela de análise deve ser de pelo menos 3 dias')
    }

    const totalDataPoints = (inputData.moodEntries?.length || 0) + (inputData.journalEntries?.length || 0)
    if (totalDataPoints < this.config.analysisWindow.minimumDataPoints) {
      throw new Error(`Dados insuficientes: mínimo ${this.config.analysisWindow.minimumDataPoints} entradas necessárias`)
    }
  }

  private getAnalysisStartDate(inputData: PredictionInputData): string {
    const endDate = new Date(inputData.analysisWindow.endDate || new Date())
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - inputData.analysisWindow.days)
    return startDate.toISOString()
  }

  private calculateTrend(previousScore: number, currentScore: number): 'improving' | 'worsening' | 'stable' {
    const difference = currentScore - previousScore
    if (Math.abs(difference) < 0.05) return 'stable'
    return difference > 0 ? 'worsening' : 'improving'
  }

  private async getPreviousPrediction(userId: string): Promise<CrisisPrediction | null> {
    // Este método seria implementado para buscar a predição anterior do banco
    // Por enquanto retorna null (primeira implementação)
    return null
  }

  /**
   * Método público para obter configuração atual
   */
  getConfig(): PredictionConfig {
    return { ...this.config }
  }

  /**
   * Método público para atualizar configuração
   */
  updateConfig(newConfig: Partial<PredictionConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

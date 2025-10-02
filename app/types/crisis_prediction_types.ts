/**
 * Crisis Prediction Engine™ - Types and Interfaces
 * Implementação do diferencial único do PulseZen
 */

// Core prediction types
export type CrisisRiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type PredictionFactorType = 'mood_decline' | 'stress_keywords' | 'sleep_pattern' | 'social_isolation' | 'negative_sentiment' | 'journal_frequency'

// Crisis definition based on multiple indicators
export interface CrisisDefinition {
  name: string
  description: string
  indicators: {
    moodThreshold: number        // Below this mood average (1-5 scale)
    sentimentThreshold: number   // Below this sentiment (-1 to 1)
    stressKeywordCount: number   // Minimum stress keywords detected
    journalFrequencyDrop: number // % drop in journal frequency
    consecutiveBadDays: number   // Days of consecutive low mood
  }
  severity: CrisisRiskLevel
}

// Prediction factors that contribute to risk assessment
export interface PredictionFactor {
  type: PredictionFactorType
  weight: number              // 0.0 to 1.0 - importance in final score
  currentValue: number        // Current measured value
  threshold: number           // Threshold for concern
  trend: 'improving' | 'stable' | 'declining'
  description: string
}

// Suggested interventions based on risk assessment
export interface CrisisIntervention {
  id: string
  priority: 'immediate' | 'urgent' | 'moderate' | 'preventive'
  type: 'breathing' | 'journaling' | 'emergency_contact' | 'professional_help' | 'self_care'
  title: string
  description: string
  estimatedTime: number       // minutes
  instructions: string[]
  triggers: PredictionFactorType[]
}

// Main prediction result
export interface CrisisPrediction {
  id: string
  userId: string
  riskScore: number           // 0.000 to 1.000
  riskLevel: CrisisRiskLevel
  confidenceScore: number     // 0.000 to 1.000 - algorithm confidence
  
  // Analysis breakdown
  factors: PredictionFactor[]
  interventions: CrisisIntervention[]
  
  // Prediction metadata
  algorithmVersion: string
  dataPointsAnalyzed: number
  analysisWindow: {           // Time window analyzed
    startDate: string
    endDate: string
    days: number
  }
  
  // Expiration and updates
  expiresAt: string          // ISO timestamp
  nextUpdateAt: string       // When to recalculate
  
  // Historical comparison
  previousPrediction?: {
    riskScore: number
    riskLevel: CrisisRiskLevel
    trend: 'improving' | 'worsening' | 'stable'
  }
  
  createdAt: string
  updatedAt: string
}

// Input data for prediction algorithm
export interface PredictionInputData {
  userId: string
  analysisWindow: {
    days: number
    endDate?: string  // Default to now
  }
  
  // Data sources
  moodEntries: Array<{
    moodLevel: string
    period: string
    date: string
    timestamp: number
    notes?: string
    activities?: string[]
    emotions?: string[]
  }>
  
  journalEntries: Array<{
    id: string
    content: string
    moodTags: Array<{
      id: string
      label: string
      category: 'positive' | 'negative' | 'neutral'
      intensity: number
    }>
    sentimentScore: number | null
    wordCount: number
    createdAt: string
    promptCategory: string
  }>
  
  // Additional context (optional)
  userProfile?: {
    age?: number
    hasAnxietyHistory?: boolean
    hasDepressionHistory?: boolean
    medicationStatus?: string
    therapyStatus?: string
  }
}

// Algorithm configuration
export interface PredictionConfig {
  version: string
  weights: {
    moodWeight: number           // 0.3 - 30% weight
    sentimentWeight: number      // 0.25 - 25% weight
    stressKeywordWeight: number  // 0.2 - 20% weight
    frequencyWeight: number      // 0.15 - 15% weight
    trendWeight: number         // 0.1 - 10% weight
  }
  
  thresholds: {
    lowRisk: number      // 0.0 - 0.3
    mediumRisk: number   // 0.3 - 0.6
    highRisk: number     // 0.6 - 0.8
    criticalRisk: number // 0.8 - 1.0
  }
  
  analysisWindow: {
    defaultDays: number          // 14 days
    minimumDataPoints: number    // Minimum entries required
    confidenceThreshold: number  // Minimum confidence for valid prediction
  }
}

// Crisis taxonomy definitions
export const CRISIS_DEFINITIONS: CrisisDefinition[] = [
  {
    name: 'Ansiedade Leve',
    description: 'Sinais iniciais de ansiedade que podem ser gerenciados com autocuidado',
    indicators: {
      moodThreshold: 3.0,
      sentimentThreshold: -0.1,
      stressKeywordCount: 2,
      journalFrequencyDrop: 20,
      consecutiveBadDays: 2
    },
    severity: 'low'
  },
  {
    name: 'Ansiedade Moderada',
    description: 'Ansiedade que requer atenção e intervenções direcionadas',
    indicators: {
      moodThreshold: 2.5,
      sentimentThreshold: -0.3,
      stressKeywordCount: 4,
      journalFrequencyDrop: 40,
      consecutiveBadDays: 3
    },
    severity: 'medium'
  },
  {
    name: 'Crise de Ansiedade Iminente',
    description: 'Alto risco de crise de ansiedade nas próximas 24-48h',
    indicators: {
      moodThreshold: 2.0,
      sentimentThreshold: -0.5,
      stressKeywordCount: 6,
      journalFrequencyDrop: 60,
      consecutiveBadDays: 4
    },
    severity: 'high'
  },
  {
    name: 'Emergência de Saúde Mental',
    description: 'Risco crítico requerendo intervenção imediata',
    indicators: {
      moodThreshold: 1.5,
      sentimentThreshold: -0.7,
      stressKeywordCount: 8,
      journalFrequencyDrop: 80,
      consecutiveBadDays: 5
    },
    severity: 'critical'
  }
]

// Default algorithm configuration
export const DEFAULT_PREDICTION_CONFIG: PredictionConfig = {
  version: '1.0',
  weights: {
    moodWeight: 0.30,        // Mood tracking é o mais importante
    sentimentWeight: 0.25,   // Análise de sentiment do journal
    stressKeywordWeight: 0.20, // Palavras-chave de stress
    frequencyWeight: 0.15,   // Frequência de entradas
    trendWeight: 0.10        // Tendência temporal
  },
  
  thresholds: {
    lowRisk: 0.30,     // 0-30% = baixo risco
    mediumRisk: 0.60,  // 30-60% = risco médio
    highRisk: 0.80,    // 60-80% = alto risco
    criticalRisk: 1.00 // 80-100% = risco crítico
  },
  
  analysisWindow: {
    defaultDays: 14,              // Análise de 2 semanas
    minimumDataPoints: 1,         // Mínimo 1 entrada para predição confiável (temporário para teste)
    confidenceThreshold: 0.65     // 65% de confiança mínima
  }
}

// Intervention templates
export const CRISIS_INTERVENTIONS: CrisisIntervention[] = [
  {
    id: 'breathing_emergency',
    priority: 'immediate',
    type: 'breathing',
    title: 'Respiração de Emergência',
    description: 'Técnica 4-7-8 para controle imediato da ansiedade',
    estimatedTime: 5,
    instructions: [
      'Inspire pelo nariz por 4 segundos',
      'Segure a respiração por 7 segundos',
      'Expire pela boca por 8 segundos',
      'Repita 4 vezes'
    ],
    triggers: ['mood_decline', 'stress_keywords']
  },
  {
    id: 'journal_reflection',
    priority: 'urgent',
    type: 'journaling',
    title: 'Reflexão Guiada',
    description: 'Exercício de journaling para processar emoções',
    estimatedTime: 15,
    instructions: [
      'Descreva o que está sentindo agora',
      'Identifique o que pode ter causado esses sentimentos',
      'Liste 3 coisas pelas quais você é grato',
      'Escreva uma frase de autocuidado para si mesmo'
    ],
    triggers: ['negative_sentiment', 'journal_frequency']
  },
  {
    id: 'emergency_contact',
    priority: 'immediate',
    type: 'emergency_contact',
    title: 'Contato de Emergência',
    description: 'Entre em contato com rede de apoio ou CVV',
    estimatedTime: 0,
    instructions: [
      'Ligue para CVV: 188',
      'Contate pessoa de confiança',
      'Procure ambiente seguro'
    ],
    triggers: ['mood_decline', 'stress_keywords', 'social_isolation']
  },
  {
    id: 'professional_help',
    priority: 'urgent',
    type: 'professional_help',
    title: 'Buscar Ajuda Profissional',
    description: 'Recomendação para consulta com profissional',
    estimatedTime: 0,
    instructions: [
      'Agende consulta com psicólogo/psiquiatra',
      'Considere terapia online',
      'Procure UBS ou CAPS mais próximo'
    ],
    triggers: ['mood_decline', 'negative_sentiment', 'stress_keywords']
  }
]

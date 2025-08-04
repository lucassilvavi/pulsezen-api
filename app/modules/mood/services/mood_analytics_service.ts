import { DateTime } from 'luxon'
import MoodEntry from '../../../models/mood_entry.js'
import { MoodService } from './mood_service.js'
import { StructuredLogger } from '../../../services/structured_logger.js'
import type { MoodPeriod } from '../../../types/mood_types.js'

export interface MoodInsight {
  id: string
  type: 'pattern' | 'milestone' | 'improvement' | 'suggestion'
  title: string
  description: string
  relevance: number // 0-1
  actionable: boolean
  metadata: {
    generatedAt: string
    algorithm: string
    confidence: number
  }
}

export interface MoodCorrelation {
  factor: string
  correlation: number
  significance: number
  description: string
}

export interface PositiveMoodStreak {
  currentStreak: number
  longestStreak: number
  isActive: boolean
  lastPositiveDate?: string
}

export interface PeriodPatterns {
  bestPeriod: MoodPeriod
  worstPeriod: MoodPeriod
  periodAverages: Record<MoodPeriod, number>
  consistency: number // 0-1, how consistent user is across periods
}

export interface WeeklyTrends {
  weeklyAverages: { week: string; average: number }[]
  trendDirection: 'improving' | 'stable' | 'declining'
  volatility: number // 0-1, how much mood varies
}

/**
 * Advanced mood analytics service
 * Leverages existing MoodService functionality and adds specialized analytics
 */
export class MoodAnalyticsService {
  /**
   * Calculate positive mood streaks (bem/excelente only)
   * REUTILIZA: Lógica base do MoodService, especializa para humor positivo
   */
  static async calculatePositiveMoodStreak(userId: string): Promise<PositiveMoodStreak> {
    try {
      const entries = await MoodEntry.byUser(userId)
        .orderBy('date', 'desc')
        .orderBy('timestamp', 'desc')

      if (entries.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          isActive: false
        }
      }

      // Filter only positive moods
      const positiveEntries = entries.filter((entry: any) => 
        entry.moodLevel === 'bem' || entry.moodLevel === 'excelente'
      )

      // Group by date and get one entry per day (most recent)
      const entriesByDate: Record<string, any> = {}
      positiveEntries.forEach((entry: any) => {
        const date = entry.date.toISODate()!
        if (!entriesByDate[date] || entry.timestamp > entriesByDate[date].timestamp) {
          entriesByDate[date] = entry
        }
      })

      const dates = Object.keys(entriesByDate).sort().reverse()
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      let isActive = false
      
      const today = DateTime.now().toISODate()!
      const yesterday = DateTime.now().minus({ days: 1 }).toISODate()!

      // Calculate current streak
      let currentDate = DateTime.now()
      for (const date of dates) {
        const daysDiff = Math.abs(currentDate.diff(DateTime.fromISO(date), 'days').days)
        
        if (Math.floor(daysDiff) === currentStreak) {
          currentStreak++
          if (date === today || date === yesterday) {
            isActive = true
          }
        } else {
          break
        }
        currentDate = DateTime.fromISO(date) as DateTime<true>
      }

      // Calculate longest streak
      for (let i = 0; i < dates.length; i++) {
        const currentDate = DateTime.fromISO(dates[i])
        
        if (i === 0) {
          tempStreak = 1
        } else {
          const prevDate = DateTime.fromISO(dates[i - 1])
          const daysDiff = Math.abs(prevDate.diff(currentDate, 'days').days)
          
          if (Math.floor(daysDiff) === 1) {
            tempStreak++
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)

      const lastPositiveEntry = positiveEntries[0]
      
      StructuredLogger.info('Calculated positive mood streak', {
        userId,
        currentStreak,
        longestStreak,
        isActive,
        totalPositiveEntries: positiveEntries.length
      })

      return {
        currentStreak,
        longestStreak,
        isActive,
        lastPositiveDate: lastPositiveEntry ? lastPositiveEntry.date.toISODate()! : undefined
      }
    } catch (error) {
      StructuredLogger.error('Error calculating positive mood streak', error)
      throw error
    }
  }

  /**
   * Analyze patterns by period of day
   * REUTILIZA: Estatísticas base do MoodService, especializa por período
   */
  static async analyzePeriodPatterns(userId: string, days: number = 30): Promise<PeriodPatterns> {
    try {
      const cutoffDate = DateTime.now().minus({ days }).toSQLDate()!
      const entries = await MoodEntry.byUser(userId)
        .where('date', '>=', cutoffDate)

      if (entries.length === 0) {
        return {
          bestPeriod: 'manha',
          worstPeriod: 'noite',
          periodAverages: { manha: 0, tarde: 0, noite: 0 },
          consistency: 0
        }
      }

      const moodValues = { 'pessimo': 1, 'mal': 2, 'neutro': 3, 'bem': 4, 'excelente': 5 }
      const periodData: Record<MoodPeriod, { total: number; count: number }> = {
        manha: { total: 0, count: 0 },
        tarde: { total: 0, count: 0 },
        noite: { total: 0, count: 0 }
      }

      // Aggregate by period
      entries.forEach((entry: any) => {
        const value = moodValues[entry.moodLevel as keyof typeof moodValues]
        periodData[entry.period as MoodPeriod].total += value
        periodData[entry.period as MoodPeriod].count++
      })

      // Calculate averages
      const periodAverages: Record<MoodPeriod, number> = {
        manha: periodData.manha.count > 0 ? periodData.manha.total / periodData.manha.count : 0,
        tarde: periodData.tarde.count > 0 ? periodData.tarde.total / periodData.tarde.count : 0,
        noite: periodData.noite.count > 0 ? periodData.noite.total / periodData.noite.count : 0
      }

      // Find best and worst periods
      const periods = Object.entries(periodAverages) as [MoodPeriod, number][]
      periods.sort((a, b) => b[1] - a[1])
      
      const bestPeriod = periods[0][0]
      const worstPeriod = periods[periods.length - 1][0]

      // Calculate consistency (lower variance = higher consistency)
      const averages = Object.values(periodAverages).filter(avg => avg > 0)
      const overallMean = averages.reduce((sum, avg) => sum + avg, 0) / averages.length
      const variance = averages.reduce((sum, avg) => sum + Math.pow(avg - overallMean, 2), 0) / averages.length
      const consistency = Math.max(0, 1 - (variance / 5)) // Normalize to 0-1

      StructuredLogger.info('Analyzed period patterns', {
        userId,
        days,
        bestPeriod,
        worstPeriod,
        consistency: Math.round(consistency * 100) / 100
      })

      return {
        bestPeriod,
        worstPeriod,
        periodAverages,
        consistency: Math.round(consistency * 100) / 100
      }
    } catch (error) {
      StructuredLogger.error('Error analyzing period patterns', error)
      throw error
    }
  }

  /**
   * Analyze weekly trends and volatility
   * REUTILIZA: getMoodTrend do MoodService, adiciona análise de tendências
   */
  static async analyzeWeeklyTrends(userId: string, weeks: number = 8): Promise<WeeklyTrends> {
    try {
      const days = weeks * 7
      const trend = await MoodService.getMoodTrend(userId, days)

      if (trend.length === 0) {
        return {
          weeklyAverages: [],
          trendDirection: 'stable',
          volatility: 0
        }
      }

      // Group by weeks
      const weeklyData: Record<string, { total: number; count: number }> = {}
      
      trend.forEach(day => {
        const date = DateTime.fromISO(day.date)
        const weekStart = date.startOf('week').toISODate()!
        
        if (!weeklyData[weekStart]) {
          weeklyData[weekStart] = { total: 0, count: 0 }
        }
        
        weeklyData[weekStart].total += day.mood
        weeklyData[weekStart].count += 1
      })

      // Calculate weekly averages
      const weeklyAverages = Object.entries(weeklyData)
        .map(([week, data]) => ({
          week,
          average: Math.round((data.total / data.count) * 100) / 100
        }))
        .sort((a, b) => a.week.localeCompare(b.week))

      // Determine trend direction
      let trendDirection: 'improving' | 'stable' | 'declining' = 'stable'
      if (weeklyAverages.length >= 2) {
        const firstHalf = weeklyAverages.slice(0, Math.floor(weeklyAverages.length / 2))
        const secondHalf = weeklyAverages.slice(Math.floor(weeklyAverages.length / 2))
        
        const firstAvg = firstHalf.reduce((sum, w) => sum + w.average, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((sum, w) => sum + w.average, 0) / secondHalf.length
        
        const improvement = secondAvg - firstAvg
        if (improvement > 0.3) trendDirection = 'improving'
        else if (improvement < -0.3) trendDirection = 'declining'
      }

      // Calculate volatility (coefficient of variation)
      const averages = weeklyAverages.map(w => w.average)
      const mean = averages.reduce((sum, avg) => sum + avg, 0) / averages.length
      const variance = averages.reduce((sum, avg) => sum + Math.pow(avg - mean, 2), 0) / averages.length
      const stdDev = Math.sqrt(variance)
      const volatility = mean > 0 ? Math.min(1, stdDev / mean) : 0

      StructuredLogger.info('Analyzed weekly trends', {
        userId,
        weeks,
        trendDirection,
        volatility: Math.round(volatility * 100) / 100,
        weeklyDataPoints: weeklyAverages.length
      })

      return {
        weeklyAverages,
        trendDirection,
        volatility: Math.round(volatility * 100) / 100
      }
    } catch (error) {
      StructuredLogger.error('Error analyzing weekly trends', error)
      throw error
    }
  }

  /**
   * Generate personalized insights based on user patterns
   * ORQUESTRA: Combine múltiplas análises para gerar insights actionáveis
   */
  static async generateInsights(userId: string): Promise<MoodInsight[]> {
    try {
      const insights: MoodInsight[] = []
      
      // Get all analytics data
      const [positiveStreak, periodPatterns, weeklyTrends, recentStats] = await Promise.all([
        this.calculatePositiveMoodStreak(userId),
        this.analyzePeriodPatterns(userId),
        this.analyzeWeeklyTrends(userId),
        MoodService.calculateMoodStats(userId, 7)
      ])

      // Insight 1: Positive streak milestone
      if (positiveStreak.currentStreak >= 3) {
        insights.push({
          id: `streak-milestone-${Date.now()}`,
          type: 'milestone',
          title: '🔥 Sequência Positiva!',
          description: `Parabéns! Você está há ${positiveStreak.currentStreak} dias com humor positivo. Continue assim!`,
          relevance: 0.9,
          actionable: true,
          metadata: {
            generatedAt: DateTime.now().toISO()!,
            algorithm: 'positive_streak_milestone',
            confidence: 0.95
          }
        })
      }

      // Insight 2: Best period pattern
      if (periodPatterns.periodAverages[periodPatterns.bestPeriod] > 3.5) {
        const periodLabels = { manha: 'manhã', tarde: 'tarde', noite: 'noite' }
        insights.push({
          id: `period-pattern-${Date.now()}`,
          type: 'pattern',
          title: `🌟 Você brilha na ${periodLabels[periodPatterns.bestPeriod]}`,
          description: `Seu humor é consistentemente melhor durante a ${periodLabels[periodPatterns.bestPeriod]}. Considere agendar atividades importantes neste período.`,
          relevance: 0.8,
          actionable: true,
          metadata: {
            generatedAt: DateTime.now().toISO()!,
            algorithm: 'period_pattern_analysis',
            confidence: 0.8
          }
        })
      }

      // Insight 3: Improvement trend
      if (weeklyTrends.trendDirection === 'improving') {
        insights.push({
          id: `improvement-trend-${Date.now()}`,
          type: 'improvement',
          title: '📈 Tendência Positiva!',
          description: 'Seu humor tem mostrado uma tendência de melhora nas últimas semanas. Você está no caminho certo!',
          relevance: 0.85,
          actionable: false,
          metadata: {
            generatedAt: DateTime.now().toISO()!,
            algorithm: 'weekly_trend_analysis',
            confidence: 0.8
          }
        })
      }

      // Insight 4: High volatility suggestion
      if (weeklyTrends.volatility > 0.4) {
        insights.push({
          id: `volatility-suggestion-${Date.now()}`,
          type: 'suggestion',
          title: '🎯 Dica de Estabilidade',
          description: 'Seu humor tem variado bastante. Considere práticas de mindfulness ou journaling para maior estabilidade emocional.',
          relevance: 0.7,
          actionable: true,
          metadata: {
            generatedAt: DateTime.now().toISO()!,
            algorithm: 'volatility_analysis',
            confidence: 0.75
          }
        })
      }

      // Insight 5: Low activity suggestion
      if (recentStats.total_entries < 3) {
        insights.push({
          id: `activity-suggestion-${Date.now()}`,
          type: 'suggestion',
          title: '📝 Mais Registros, Mais Insights',
          description: 'Registre seu humor com mais frequência para obter análises mais precisas e personalizadas.',
          relevance: 0.6,
          actionable: true,
          metadata: {
            generatedAt: DateTime.now().toISO()!,
            algorithm: 'activity_frequency_analysis',
            confidence: 0.9
          }
        })
      }

      // Sort by relevance
      insights.sort((a, b) => b.relevance - a.relevance)

      StructuredLogger.info('Generated mood insights', {
        userId,
        insightCount: insights.length,
        insightTypes: insights.map(i => i.type)
      })

      return insights
    } catch (error) {
      StructuredLogger.error('Error generating mood insights', error)
      throw error
    }
  }

  /**
   * Get mood correlations with other activities (placeholder for future expansion)
   * EXTENSIBILIDADE: Framework para correlações futuras com journal, breathing, etc.
   */
  static async getMoodCorrelations(userId: string): Promise<MoodCorrelation[]> {
    try {
      // TODO: Implement cross-module correlations
      // This is a placeholder for future implementation when other modules are integrated
      
      const correlations: MoodCorrelation[] = [
        {
          factor: 'time_of_day',
          correlation: 0.65,
          significance: 0.8,
          description: 'Humor tende a ser melhor em determinados períodos do dia'
        }
      ]

      StructuredLogger.info('Retrieved mood correlations', {
        userId,
        correlationCount: correlations.length
      })

      return correlations
    } catch (error) {
      StructuredLogger.error('Error getting mood correlations', error)
      throw error
    }
  }
}

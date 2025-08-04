import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import MoodEntry from '../../../models/mood_entry.js'
import { StructuredLogger } from '../../../services/structured_logger.js'
import type { 
  CreateMoodEntryData, 
  MoodEntryFilters, 
  MoodLevel, 
  MoodPeriod,
  MoodStatsResponse,
  MoodTrendResponse
} from '../../../types/mood_types.js'

export class MoodService {
  /**
   * Create a new mood entry
   */
  static async createMoodEntry(data: CreateMoodEntryData): Promise<{ success: boolean; entry?: MoodEntry; message?: string }> {
    try {
      // Validate that user hasn't already answered for this period today
      const existingEntry = await MoodEntry.query()
        .where('userId', data.userId)
        .where('date', data.date)
        .where('period', data.period)
        .first()

      if (existingEntry) {
        return {
          success: false,
          message: 'Você já registrou seu humor para este período hoje'
        }
      }

      // Create the mood entry
      const entry = await MoodEntry.create({
        id: uuidv4(),
        userId: data.userId,
        moodLevel: data.moodLevel,
        period: data.period,
        date: DateTime.fromISO(data.date),
        timestamp: data.timestamp || Date.now(),
        notes: data.notes || null,
        activities: data.activities || null,
        emotions: data.emotions || null
      })

      StructuredLogger.info('Mood entry created successfully', {
        entryId: entry.id,
        userId: data.userId,
        moodLevel: data.moodLevel,
        period: data.period
      })

      return {
        success: true,
        entry,
        message: 'Humor registrado com sucesso!'
      }
    } catch (error) {
      StructuredLogger.error('Error creating mood entry', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Get mood entries with filters
   */
  static async getMoodEntries(userId: string, filters: MoodEntryFilters = {}) {
    try {
      let query = MoodEntry.byUser(userId).orderBy('timestamp', 'desc')

      // Apply filters
      if (filters.date) {
        query = query.where('date', filters.date)
      }

      if (filters.period) {
        query = query.where('period', filters.period)
      }

      if (filters.moodLevel) {
        query = query.where('moodLevel', filters.moodLevel)
      }

      if (filters.startDate && filters.endDate) {
        query = query.whereBetween('date', [filters.startDate, filters.endDate])
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.offset(filters.offset)
      }

      const entries = await query

      StructuredLogger.info('Retrieved mood entries', {
        userId,
        count: entries.length,
        filters
      })

      return entries
    } catch (error) {
      StructuredLogger.error('Error retrieving mood entries', error)
      throw error
    }
  }

  /**
   * Calculate mood statistics for a user
   */
  static async calculateMoodStats(userId: string, days: number = 7): Promise<MoodStatsResponse> {
    try {
      const cutoffDate = DateTime.now().minus({ days }).toSQLDate()!
      const entries = await MoodEntry.byUser(userId)
        .where('date', '>=', cutoffDate)
        .orderBy('timestamp', 'desc')

      if (entries.length === 0) {
        return {
          average_mood: 0,
          total_entries: 0,
          mood_distribution: {
            'excelente': 0,
            'bem': 0,
            'neutro': 0,
            'mal': 0,
            'pessimo': 0
          },
          period_distribution: {
            'manha': 0,
            'tarde': 0,
            'noite': 0
          },
          streak: 0
        }
      }

      // Calculate average mood
      const moodValues = { 'pessimo': 1, 'mal': 2, 'neutro': 3, 'bem': 4, 'excelente': 5 }
      const totalMoodValue = entries.reduce((sum, entry) => sum + moodValues[entry.moodLevel], 0)
      const averageMood = totalMoodValue / entries.length

      // Calculate mood distribution
      const moodDistribution: Record<MoodLevel, number> = {
        'excelente': 0,
        'bem': 0,
        'neutro': 0,
        'mal': 0,
        'pessimo': 0
      }

      // Calculate period distribution
      const periodDistribution: Record<MoodPeriod, number> = {
        'manha': 0,
        'tarde': 0,
        'noite': 0
      }

      entries.forEach(entry => {
        moodDistribution[entry.moodLevel]++
        periodDistribution[entry.period]++
      })

      // Calculate streak
      const streak = await this.calculateMoodStreak(userId)

      // Get last entry
      const lastEntry = entries[0] // Already ordered by timestamp desc

      const stats: MoodStatsResponse = {
        average_mood: Math.round(averageMood * 100) / 100,
        total_entries: entries.length,
        mood_distribution: moodDistribution,
        period_distribution: periodDistribution,
        streak,
        last_entry: lastEntry ? {
          id: lastEntry.id,
          user_id: lastEntry.userId,
          mood_level: lastEntry.moodLevel,
          period: lastEntry.period,
          date: lastEntry.date.toISODate()!,
          timestamp: lastEntry.timestamp,
          notes: lastEntry.notes,
          activities: lastEntry.activities,
          emotions: lastEntry.emotions,
          created_at: lastEntry.createdAt.toISO()!,
          updated_at: lastEntry.updatedAt.toISO()!
        } : undefined
      }

      StructuredLogger.info('Calculated mood stats', {
        userId,
        days,
        totalEntries: entries.length,
        averageMood
      })

      return stats
    } catch (error) {
      StructuredLogger.error('Error calculating mood stats', error)
      throw error
    }
  }

  /**
   * Get mood trend data
   */
  static async getMoodTrend(userId: string, days: number = 30): Promise<MoodTrendResponse[]> {
    try {
      const cutoffDate = DateTime.now().minus({ days }).toSQLDate()!
      const entries = await MoodEntry.byUser(userId)
        .where('date', '>=', cutoffDate)
        .orderBy('date', 'asc')

      // Group by date and calculate daily averages
      const dailyMoods: Record<string, { total: number; count: number }> = {}
      const moodValues = { 'pessimo': 1, 'mal': 2, 'neutro': 3, 'bem': 4, 'excelente': 5 }

      entries.forEach(entry => {
        const date = entry.date.toISODate()!
        if (!dailyMoods[date]) {
          dailyMoods[date] = { total: 0, count: 0 }
        }
        dailyMoods[date].total += moodValues[entry.moodLevel]
        dailyMoods[date].count++
      })

      const trend: MoodTrendResponse[] = Object.entries(dailyMoods).map(([date, data]) => ({
        date,
        mood: Math.round((data.total / data.count) * 100) / 100,
        entries_count: data.count
      }))

      StructuredLogger.info('Generated mood trend', {
        userId,
        days,
        dataPoints: trend.length
      })

      return trend
    } catch (error) {
      StructuredLogger.error('Error generating mood trend', error)
      throw error
    }
  }

  /**
   * Validate if user can create entry for specific period
   */
  static async validatePeriodEntry(userId: string, date: string, period: MoodPeriod): Promise<boolean> {
    try {
      const existingEntry = await MoodEntry.query()
        .where('userId', userId)
        .where('date', date)
        .where('period', period)
        .first()

      return !existingEntry
    } catch (error) {
      StructuredLogger.error('Error validating period entry', error)
      return false
    }
  }

  /**
   * Calculate consecutive days streak
   */
  private static async calculateMoodStreak(userId: string): Promise<number> {
    try {
      const entries = await MoodEntry.byUser(userId)
        .orderBy('date', 'desc')

      if (entries.length === 0) return 0

      // Group by date
      const entriesByDate: Record<string, MoodEntry[]> = {}
      entries.forEach(entry => {
        const date = entry.date.toISODate()!
        if (!entriesByDate[date]) {
          entriesByDate[date] = []
        }
        entriesByDate[date].push(entry)
      })

      const dates = Object.keys(entriesByDate).sort().reverse()
      let streak = 0
      let currentDate = DateTime.now()

      for (const date of dates) {
        const daysDiff = Math.abs(currentDate.diff(DateTime.fromISO(date), 'days').days)
        
        if (Math.floor(daysDiff) === streak) {
          streak++
          currentDate = DateTime.fromISO(date, { setZone: true })
        } else {
          break
        }
      }

      return streak
    } catch (error) {
      StructuredLogger.error('Error calculating mood streak', error)
      return 0
    }
  }

  /**
   * Get current period based on time
   */
  static getCurrentPeriod(): MoodPeriod {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      return 'manha'
    } else if (hour >= 12 && hour < 18) {
      return 'tarde'
    } else {
      return 'noite'
    }
  }
}

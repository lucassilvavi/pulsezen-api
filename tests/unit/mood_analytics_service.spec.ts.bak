import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { MoodAnalyticsService } from '../../../app/modules/mood/services/mood_analytics_service.js'
import MoodEntry from '../../../app/models/mood_entry.js'

test.group('MoodAnalyticsService', (group) => {
  // Test data setup
  const testUserId = 'test-user-analytics'
  const testEntries = [
    // Current week - positive streak
    { moodLevel: 'bem', period: 'manha', date: DateTime.now() },
    { moodLevel: 'excelente', period: 'tarde', date: DateTime.now().minus({ days: 1 }) },
    { moodLevel: 'bem', period: 'noite', date: DateTime.now().minus({ days: 2 }) },
    
    // Previous week - mixed
    { moodLevel: 'neutro', period: 'manha', date: DateTime.now().minus({ days: 7 }) },
    { moodLevel: 'mal', period: 'tarde', date: DateTime.now().minus({ days: 8 }) },
    { moodLevel: 'bem', period: 'noite', date: DateTime.now().minus({ days: 9 }) },
    
    // Earlier data for trends
    { moodLevel: 'pessimo', period: 'manha', date: DateTime.now().minus({ days: 14 }) },
    { moodLevel: 'neutro', period: 'tarde', date: DateTime.now().minus({ days: 15 }) },
    { moodLevel: 'bem', period: 'noite', date: DateTime.now().minus({ days: 16 }) }
  ]

  group.setup(async () => {
    // Mock MoodEntry.byUser to return our test data
    const originalByUser = MoodEntry.byUser
    MoodEntry.byUser = () => ({
      orderBy: () => ({
        orderBy: () => testEntries.map(entry => ({
          ...entry,
          userId: testUserId,
          timestamp: entry.date,
          date: { toISODate: () => entry.date.toISODate() }
        }))
      }),
      where: () => testEntries.map(entry => ({
        ...entry,
        userId: testUserId,
        timestamp: entry.date,
        date: { toISODate: () => entry.date.toISODate() }
      }))
    }) as any
  })

  test('calculatePositiveMoodStreak - should calculate current positive streak correctly', async ({ assert }) => {
    const result = await MoodAnalyticsService.calculatePositiveMoodStreak(testUserId)
    
    assert.isObject(result)
    assert.isNumber(result.currentStreak)
    assert.isNumber(result.longestStreak)
    assert.isBoolean(result.isActive)
    
    // Should have a current streak based on recent positive entries
    assert.isTrue(result.currentStreak >= 0)
    assert.isTrue(result.longestStreak >= result.currentStreak)
  })

  test('calculatePositiveMoodStreak - should handle empty data', async ({ assert }) => {
    // Mock empty data
    const originalByUser = MoodEntry.byUser
    MoodEntry.byUser = () => ({
      orderBy: () => ({
        orderBy: () => []
      })
    }) as any

    const result = await MoodAnalyticsService.calculatePositiveMoodStreak('empty-user')
    
    assert.equal(result.currentStreak, 0)
    assert.equal(result.longestStreak, 0)
    assert.isFalse(result.isActive)
    assert.isUndefined(result.lastPositiveDate)

    // Restore original
    MoodEntry.byUser = originalByUser
  })

  test('analyzePeriodPatterns - should analyze patterns by period correctly', async ({ assert }) => {
    const result = await MoodAnalyticsService.analyzePeriodPatterns(testUserId, 30)
    
    assert.isObject(result)
    assert.property(result, 'bestPeriod')
    assert.property(result, 'worstPeriod')
    assert.property(result, 'periodAverages')
    assert.property(result, 'consistency')
    
    // Should have valid period names
    assert.include(['manha', 'tarde', 'noite'], result.bestPeriod)
    assert.include(['manha', 'tarde', 'noite'], result.worstPeriod)
    
    // Consistency should be between 0 and 1
    assert.isTrue(result.consistency >= 0 && result.consistency <= 1)
    
    // Period averages should exist for all periods
    assert.property(result.periodAverages, 'manha')
    assert.property(result.periodAverages, 'tarde')
    assert.property(result.periodAverages, 'noite')
  })

  test('analyzePeriodPatterns - should handle empty data gracefully', async ({ assert }) => {
    // Mock empty data
    const originalByUser = MoodEntry.byUser
    MoodEntry.byUser = () => ({
      where: () => []
    }) as any

    const result = await MoodAnalyticsService.analyzePeriodPatterns('empty-user')
    
    assert.equal(result.bestPeriod, 'manha')
    assert.equal(result.worstPeriod, 'noite')
    assert.equal(result.consistency, 0)
    
    // All averages should be 0
    assert.equal(result.periodAverages.manha, 0)
    assert.equal(result.periodAverages.tarde, 0)
    assert.equal(result.periodAverages.noite, 0)

    // Restore original
    MoodEntry.byUser = originalByUser
  })

  test('analyzeWeeklyTrends - should analyze weekly trends correctly', async ({ assert }) => {
    // Mock MoodService.getMoodTrend
    const mockTrendData = [
      { date: DateTime.now().toISODate()!, mood: 4 },
      { date: DateTime.now().minus({ days: 1 }).toISODate()!, mood: 5 },
      { date: DateTime.now().minus({ days: 2 }).toISODate()!, mood: 4 },
      { date: DateTime.now().minus({ days: 7 }).toISODate()!, mood: 3 },
      { date: DateTime.now().minus({ days: 8 }).toISODate()!, mood: 2 },
      { date: DateTime.now().minus({ days: 14 }).toISODate()!, mood: 1 }
    ]

    // Mock the MoodService.getMoodTrend method
    const { MoodService } = await import('../../../app/modules/mood/services/mood_service.js')
    const originalGetMoodTrend = MoodService.getMoodTrend
    MoodService.getMoodTrend = async () => mockTrendData

    const result = await MoodAnalyticsService.analyzeWeeklyTrends(testUserId, 4)
    
    assert.isObject(result)
    assert.isArray(result.weeklyAverages)
    assert.include(['improving', 'stable', 'declining'], result.trendDirection)
    assert.isNumber(result.volatility)
    assert.isTrue(result.volatility >= 0 && result.volatility <= 1)

    // Restore original
    MoodService.getMoodTrend = originalGetMoodTrend
  })

  test('generateInsights - should generate meaningful insights', async ({ assert }) => {
    // Mock dependencies
    const { MoodService } = await import('../../../app/modules/mood/services/mood_service.js')
    const originalCalculateMoodStats = MoodService.calculateMoodStats
    MoodService.calculateMoodStats = async () => ({
      total_entries: 5,
      mood_counts: { pessimo: 1, mal: 1, neutro: 1, bem: 1, excelente: 1 },
      average_mood: 3.0,
      most_common_mood: 'neutro',
      mood_percentages: { pessimo: 20, mal: 20, neutro: 20, bem: 20, excelente: 20 }
    })

    const result = await MoodAnalyticsService.generateInsights(testUserId)
    
    assert.isArray(result)
    
    // Each insight should have the required structure
    result.forEach(insight => {
      assert.property(insight, 'id')
      assert.property(insight, 'type')
      assert.property(insight, 'title')
      assert.property(insight, 'description')
      assert.property(insight, 'relevance')
      assert.property(insight, 'actionable')
      assert.property(insight, 'metadata')
      
      assert.include(['pattern', 'milestone', 'improvement', 'suggestion'], insight.type)
      assert.isTrue(insight.relevance >= 0 && insight.relevance <= 1)
      assert.isBoolean(insight.actionable)
    })

    // Insights should be sorted by relevance (descending)
    for (let i = 1; i < result.length; i++) {
      assert.isTrue(result[i - 1].relevance >= result[i].relevance)
    }

    // Restore original
    MoodService.calculateMoodStats = originalCalculateMoodStats
  })

  test('getMoodCorrelations - should return correlation structure', async ({ assert }) => {
    const result = await MoodAnalyticsService.getMoodCorrelations(testUserId)
    
    assert.isArray(result)
    
    // Each correlation should have the required structure
    result.forEach(correlation => {
      assert.property(correlation, 'factor')
      assert.property(correlation, 'correlation')
      assert.property(correlation, 'significance')
      assert.property(correlation, 'description')
      
      assert.isString(correlation.factor)
      assert.isNumber(correlation.correlation)
      assert.isNumber(correlation.significance)
      assert.isString(correlation.description)
    })
  })

  test('Analytics service error handling', async ({ assert }) => {
    // Mock error scenarios
    const originalByUser = MoodEntry.byUser
    MoodEntry.byUser = () => {
      throw new Error('Database connection failed')
    }

    // Should handle errors gracefully
    try {
      await MoodAnalyticsService.calculatePositiveMoodStreak(testUserId)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.instanceOf(error, Error)
      assert.equal(error.message, 'Database connection failed')
    }

    // Restore original
    MoodEntry.byUser = originalByUser
  })

  test('Parameter validation in analytics methods', async ({ assert }) => {
    // Test with various parameter ranges
    const validDays = [1, 30, 365]
    const validWeeks = [1, 8, 52]

    for (const days of validDays) {
      const result = await MoodAnalyticsService.analyzePeriodPatterns(testUserId, days)
      assert.isObject(result)
    }

    for (const weeks of validWeeks) {
      // Mock MoodService for this test
      const { MoodService } = await import('../../../app/modules/mood/services/mood_service.js')
      const originalGetMoodTrend = MoodService.getMoodTrend
      MoodService.getMoodTrend = async () => []

      const result = await MoodAnalyticsService.analyzeWeeklyTrends(testUserId, weeks)
      assert.isObject(result)

      // Restore
      MoodService.getMoodTrend = originalGetMoodTrend
    }
  })
})

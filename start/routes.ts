/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import HealthController from '#controllers/health_controller'
import BiometricAuthsController from '#controllers/biometric_auths_controller'
import PasswordResetController from '#controllers/password_reset_controller'
import AuthController from '#modules/auth/controllers/auth_controller'
import JournalController from '#modules/journal/controllers/journal_controller'
import JournalAnalyticsController from '#modules/journal/controllers/journal_analytics_controller'
import MoodController from '#modules/mood/controllers/mood_controller'
import MoodAnalyticsController from '#modules/mood/controllers/mood_analytics_controller'
import CrisisPredictionController from '#controllers/CrisisPredictionController'
import SuggestionController from '#modules/suggestions/controllers/suggestion_controller'
import SESTestController from '#controllers/ses_test_controller'
import { middleware } from '#start/kernel'

// Health check routes (no authentication required)
router.get('/health', [HealthController, 'check'])
router.get('/ping', [HealthController, 'ping'])

// SES Test routes (for debugging email functionality)
router.group(() => {
  router.get('/config', [SESTestController, 'checkConfiguration']) // Check AWS SES configuration
  router.post('/test-email', [SESTestController, 'testEmail']) // Test basic email sending
  router.post('/test-password-reset', [SESTestController, 'testPasswordReset']) // Test password reset email
}).prefix('/ses')

// API v1 routes
router.group(() => {
  // Root endpoint
  router.get('/', async () => {
    return {
      name: 'PulseZen API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api/v1/docs',
      endpoints: {
        auth: '/api/v1/auth',
        journal: '/api/v1/journal',
        breathing: '/api/v1/breathing',
        mood: '/api/v1/mood',
        crisis: '/api/v1/crisis',
        suggestions: '/api/v1/suggestions'
      }
    }
  })

  // Authentication routes (no auth middleware)
  router.group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router.post('/refresh-token', [AuthController, 'refreshToken'])
    router.post('/validate-password', [AuthController, 'validatePassword'])
    
    // Biometric authentication routes (public endpoints)
    router.post('/biometric/login', [BiometricAuthsController, 'biometricLogin'])
    router.post('/backup-code/login', [BiometricAuthsController, 'backupCodeLogin'])
    router.post('/device/capabilities', [BiometricAuthsController, 'checkDeviceCapabilities'])
  }).prefix('/auth').middleware([middleware.rate_limit()])

  // Password reset routes (no auth required)
  router.group(() => {
    router.post('/request', [PasswordResetController, 'requestReset']) // Request password reset
    router.get('/validate', [PasswordResetController, 'validateToken']) // Validate reset token (web)
    router.post('/reset', [PasswordResetController, 'resetPassword']) // Reset password with token (web)
    router.post('/verify-code', [PasswordResetController, 'verifyCode']) // Verify 6-digit code (mobile)
    router.post('/reset-with-code', [PasswordResetController, 'resetWithCode']) // Reset password with code (mobile)
  }).prefix('/password-reset').middleware([middleware.rate_limit()])

  // Protected authentication routes
  router.get('/auth/profile', [AuthController, 'profile']).middleware([middleware.auth()])
  router.put('/auth/profile', [AuthController, 'updateProfile']).middleware([middleware.auth()])
  router.post('/auth/complete-onboarding', [AuthController, 'completeOnboarding']).middleware([middleware.auth()])
  router.post('/auth/logout', [AuthController, 'logout']).middleware([middleware.auth()])

  // Protected biometric routes (require authentication)
  router.group(() => {
    router.post('/device/register', [BiometricAuthsController, 'registerDevice'])
    router.get('/devices', [BiometricAuthsController, 'getDevices'])
    router.post('/biometric/enable', [BiometricAuthsController, 'enableBiometric'])
    router.get('/stats', [BiometricAuthsController, 'getAuthStats'])
    router.delete('/device/:deviceId', [BiometricAuthsController, 'revokeDevice'])
    router.post('/backup-codes/generate', [BiometricAuthsController, 'generateBackupCodes'])
    router.get('/backup-codes', [BiometricAuthsController, 'getBackupCodes'])
  }).prefix('/auth').middleware([middleware.auth()])

  // Journal routes
  router.group(() => {
    // Public routes (no auth needed)
    router.get('/prompts', [JournalController, 'getPrompts'])
    
    // Protected routes (require auth)
    router.group(() => {
      // CRUD operations
      router.get('/', [JournalController, 'index'])
      router.post('/', [JournalController, 'store'])
      router.get('/search', [JournalController, 'search'])
      router.get('/search/suggestions', [JournalController, 'searchSuggestions'])
      router.get('/stats', [JournalController, 'getStats'])
      
      // Analytics routes
      router.get('/analytics', [JournalAnalyticsController, 'getJournalAnalytics'])
      router.get('/analytics/timeline', [JournalAnalyticsController, 'getTimelineData'])
      router.get('/analytics/mood-distribution', [JournalAnalyticsController, 'getMoodDistribution'])
      router.get('/analytics/streak', [JournalAnalyticsController, 'getStreakData'])
      router.get('/analytics/report', [JournalAnalyticsController, 'generateTherapeuticReport'])
      
      router.get('/:id', [JournalController, 'show'])
      router.put('/:id', [JournalController, 'update'])
      router.delete('/:id', [JournalController, 'destroy'])
    }).middleware([middleware.auth()])
  }).prefix('/journal')

  // Breathing routes
  // router.group(() => {
  //   // Breathing routes implementation
  // }).prefix('/breathing') // .middleware('auth')

  // Mood routes
  router.group(() => {
    // All mood routes require authentication
    router.group(() => {
      // CRUD operations for mood entries
      router.get('/entries', [MoodController, 'index']) // List entries with filters
      router.post('/entries', [MoodController, 'store']) // Create new entry
      router.get('/entries/:id', [MoodController, 'show']) // Get specific entry
      router.put('/entries/:id', [MoodController, 'update']) // Update entry (24h limit)
      router.delete('/entries/:id', [MoodController, 'destroy']) // Delete entry
      
      // Statistics and analytics
      router.get('/stats', [MoodController, 'stats']) // Get mood statistics
      router.get('/trend', [MoodController, 'trend']) // Get mood trend data
      
      // Validation endpoints
      router.get('/validate/:period', [MoodController, 'validatePeriod']) // Check if can create entry for period
      
      // Advanced Analytics endpoints
      router.get('/analytics/positive-streak', [MoodAnalyticsController, 'getPositiveStreak']) // Get positive mood streak
      router.get('/analytics/period-patterns', [MoodAnalyticsController, 'getPeriodPatterns']) // Get patterns by period
      router.get('/analytics/weekly-trends', [MoodAnalyticsController, 'getWeeklyTrends']) // Get weekly trends
      router.get('/analytics/insights', [MoodAnalyticsController, 'getInsights']) // Get personalized insights
      router.get('/analytics/correlations', [MoodAnalyticsController, 'getCorrelations']) // Get mood correlations
      router.get('/analytics/dashboard', [MoodAnalyticsController, 'getDashboard']) // Get complete analytics dashboard
    }).middleware([
      middleware.auth(), 
      middleware.rate_limit(),
      middleware.mood_ownership(),
      middleware.mood_sanitization()
    ])
  }).prefix('/mood')

  // Crisis Prediction Engine routes
  router.group(() => {
    // All crisis prediction routes require authentication
    router.group(() => {
      // Main prediction endpoints
      router.post('/predict', [CrisisPredictionController, 'predict']) // Generate new prediction
      router.get('/prediction/latest', [CrisisPredictionController, 'getLatest']) // Get latest prediction
      router.get('/predictions/history', [CrisisPredictionController, 'getHistory']) // Get prediction history
      
      // Analytics and statistics
      router.get('/stats', [CrisisPredictionController, 'getStats']) // Get prediction statistics
      
      // Admin endpoints (future use)
      router.put('/config', [CrisisPredictionController, 'updateConfig']) // Update algorithm config
    }).middleware([
      middleware.auth(),
      middleware.rate_limit()
    ])
  }).prefix('/crisis')

  // Suggestions routes
  router.group(() => {
    // All suggestion routes require authentication
    router.group(() => {
      // Daily suggestions
      router.get('/daily', [SuggestionController, 'getDailySuggestions']) // Get daily suggestions (4 per day)
      
      // Individual suggestion operations
      router.get('/:id', [SuggestionController, 'getSuggestion']) // Get specific suggestion content
      router.post('/:userSuggestionId/read', [SuggestionController, 'markAsRead']) // Mark suggestion as read
      router.post('/:userSuggestionId/rate', [SuggestionController, 'rateSuggestion']) // Rate a suggestion
      
      // User statistics
      router.get('/stats', [SuggestionController, 'getStats']) // Get user suggestion statistics
    }).middleware([
      middleware.auth(),
      middleware.rate_limit()
    ])
  }).prefix('/suggestions')

}).prefix('/api/v1')

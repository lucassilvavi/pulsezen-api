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
import AuthController from '#modules/auth/controllers/auth_controller'
import JournalController from '#modules/journal/controllers/journal_controller'
import MusicController from '#modules/music/controllers/music_controller'
import MoodController from '#modules/mood/controllers/mood_controller'
import MoodAnalyticsController from '#modules/mood/controllers/mood_analytics_controller'
import { middleware } from '#start/kernel'

// Health check routes (no authentication required)
router.get('/health', [HealthController, 'check'])
router.get('/info', [HealthController, 'info'])

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
        music: '/api/v1/music',
        mood: '/api/v1/mood'
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
      router.get('/:id', [JournalController, 'show'])
      router.put('/:id', [JournalController, 'update'])
      router.delete('/:id', [JournalController, 'destroy'])
    }).middleware([middleware.auth()])
  }).prefix('/journal')

  // Breathing routes
  // router.group(() => {
  //   // Breathing routes implementation
  // }).prefix('/breathing') // .middleware('auth')

  // Music routes
  router.group(() => {
    // Public routes (no auth needed)
    router.get('/categories', [MusicController, 'getCategories'])
    router.get('/categories/:id', [MusicController, 'getCategoryById'])
    router.get('/tracks', [MusicController, 'getTracks'])
    router.get('/tracks/:id', [MusicController, 'getTrackById'])
    
    // Protected routes (require auth)
    router.group(() => {
      // Playlist operations
      router.get('/playlists', [MusicController, 'getPlaylists'])
      router.post('/playlists', [MusicController, 'createPlaylist'])
      router.put('/playlists/:id', [MusicController, 'updatePlaylist'])
      router.delete('/playlists/:id', [MusicController, 'deletePlaylist'])
      router.post('/playlists/:id/tracks', [MusicController, 'addTracksToPlaylist'])
      router.delete('/playlists/:id/tracks', [MusicController, 'removeTracksFromPlaylist'])
      
      // Favorites operations
      router.get('/favorites', [MusicController, 'getFavorites'])
      router.post('/favorites/toggle/:trackId', [MusicController, 'toggleFavorite'])
    }).middleware([middleware.auth()])
  }).prefix('/music')

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

}).prefix('/api/v1')

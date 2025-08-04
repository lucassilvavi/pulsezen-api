import { test } from '@japa/runner'
import { MusicService } from '#modules/music/services/music_service'

test.group('Music Service', () => {
  test('should get all music categories', async ({ assert }) => {
    const musicService = new MusicService()
    const categories = await musicService.getCategories()
    
    assert.isArray(categories)
    assert.isAbove(categories.length, 0)
    
    // Check first category structure
    const firstCategory = categories[0]
    assert.properties(firstCategory, ['id', 'title', 'description', 'icon', 'color', 'tracks'])
    assert.isArray(firstCategory.tracks)
  })

  test('should get specific category by ID', async ({ assert }) => {
    const musicService = new MusicService()
    const categories = await musicService.getCategories()
    
    if (categories.length > 0) {
      const categoryId = categories[0].id
      const category = await musicService.getCategoryById(categoryId)
      
      assert.equal(category.id, categoryId)
      assert.properties(category, ['id', 'title', 'description', 'icon', 'color', 'tracks'])
    }
  })

  test('should get all tracks', async ({ assert }) => {
    const musicService = new MusicService()
    const tracks = await musicService.getTracks()
    
    assert.isArray(tracks)
    assert.isAbove(tracks.length, 0)
    
    // Check first track structure
    const firstTrack = tracks[0]
    assert.properties(firstTrack, ['id', 'title', 'artist', 'duration', 'durationFormatted', 'category'])
  })

  test('should create a playlist', async ({ assert }) => {
    const musicService = new MusicService()
    const userId = '123e4567-e89b-12d3-a456-426614174000' // Mock user ID
    
    const playlistData = {
      name: 'Test Playlist',
      description: 'A test playlist',
      isPublic: false,
      trackIds: []
    }
    
    const playlist = await musicService.createPlaylist(userId, playlistData)
    
    assert.properties(playlist, ['id', 'name', 'description', 'isPublic', 'isSystem', 'tracks'])
    assert.equal(playlist.name, 'Test Playlist')
    assert.equal(playlist.isPublic, false)
    assert.equal(playlist.isSystem, false)
  })

  test('should get user playlists', async ({ assert }) => {
    const musicService = new MusicService()
    const userId = '123e4567-e89b-12d3-a456-426614174000' // Mock user ID
    
    // Create a playlist first
    const playlistData = {
      name: 'User Test Playlist',
      description: 'A user test playlist',
      isPublic: true,
      trackIds: []
    }
    
    await musicService.createPlaylist(userId, playlistData)
    
    // Get user playlists
    const playlists = await musicService.getUserPlaylists(userId)
    
    assert.isArray(playlists)
    assert.isAbove(playlists.length, 0)
    
    const userPlaylist = playlists.find(p => p.name === 'User Test Playlist')
    assert.isObject(userPlaylist)
  })

  test('should get favorite tracks (empty initially)', async ({ assert }) => {
    const musicService = new MusicService()
    const userId = '123e4567-e89b-12d3-a456-426614174000' // Mock user ID
    
    const favorites = await musicService.getFavoriteTracks(userId)
    
    assert.isArray(favorites)
    // Should be empty initially
    assert.equal(favorites.length, 0)
  })

  test('should toggle favorite track', async ({ assert }) => {
    const musicService = new MusicService()
    const userId = '123e4567-e89b-12d3-a456-426614174000' // Mock user ID
    
    // Get first track
    const tracks = await musicService.getTracks()
    assert.isAbove(tracks.length, 0)
    
    const trackId = tracks[0].id
    
    // Toggle favorite (should add to favorites)
    const result1 = await musicService.toggleFavorite(userId, trackId)
    assert.equal(result1.isFavorite, true)
    
    // Toggle again (should remove from favorites)
    const result2 = await musicService.toggleFavorite(userId, trackId)
    assert.equal(result2.isFavorite, false)
  })

  test('should get favorite tracks after adding', async ({ assert }) => {
    const musicService = new MusicService()
    const userId = '123e4567-e89b-12d3-a456-426614174000' // Mock user ID
    
    // Get first track
    const tracks = await musicService.getTracks()
    assert.isAbove(tracks.length, 0)
    
    const trackId = tracks[0].id
    
    // Add to favorites
    await musicService.toggleFavorite(userId, trackId)
    
    // Get favorites
    const favorites = await musicService.getFavoriteTracks(userId)
    
    assert.isArray(favorites)
    assert.equal(favorites.length, 1)
    assert.equal(favorites[0].id, trackId)
  })
})

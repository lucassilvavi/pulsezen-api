import { test } from '@japa/runner'

test.group('Music API', (group) => {
  group.setup(async () => {
    // Setup test database or any other requirements
  })

  test('GET /api/v1/music/categories', async ({ client, assert }) => {
    const response = await client.get('/api/v1/music/categories')
    
    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      data: []
    })
    
    const body = response.body()
    assert.isArray(body.data)
  })

  test('GET /api/v1/music/categories/:id', async ({ client }) => {
    // First get categories to get an ID
    const categoriesResponse = await client.get('/api/v1/music/categories')
    const categories = categoriesResponse.body().data
    
    if (categories.length > 0) {
      const categoryId = categories[0].id
      const response = await client.get(`/api/v1/music/categories/${categoryId}`)
      
      response.assertStatus(200)
      response.assertBodyContains({
        success: true,
        data: {
          id: categoryId
        }
      })
    }
  })

  test('GET /api/v1/music/tracks', async ({ client, assert }) => {
    const response = await client.get('/api/v1/music/tracks')
    
    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      data: []
    })
    
    const body = response.body()
    assert.isArray(body.data)
  })

  test('GET /api/v1/music/tracks/:id', async ({ client }) => {
    // First get tracks to get an ID
    const tracksResponse = await client.get('/api/v1/music/tracks')
    const tracks = tracksResponse.body().data
    
    if (tracks.length > 0) {
      const trackId = tracks[0].id
      const response = await client.get(`/api/v1/music/tracks/${trackId}`)
      
      response.assertStatus(200)
      response.assertBodyContains({
        success: true,
        data: {
          id: trackId
        }
      })
    }
  })

  test('GET /api/v1/music/playlists (requires auth)', async ({ client }) => {
    // This test should fail without auth
    const response = await client.get('/api/v1/music/playlists')
    
    // Should be 401 without auth
    response.assertStatus(401)
  })

  test('POST /api/v1/music/playlists (requires auth)', async ({ client }) => {
    const playlistData = {
      name: 'Test API Playlist',
      description: 'A test playlist from API',
      isPublic: false,
      trackIds: []
    }
    
    // This test should fail without auth
    const response = await client.post('/api/v1/music/playlists').json(playlistData)
    
    // Should be 401 without auth
    response.assertStatus(401)
  })

  test('POST /api/v1/music/favorites/toggle/:trackId (requires auth)', async ({ client }) => {
    // Get first track
    const tracksResponse = await client.get('/api/v1/music/tracks')
    const tracks = tracksResponse.body().data
    
    if (tracks.length > 0) {
      const trackId = tracks[0].id
      
      // This test should fail without auth
      const response = await client.post(`/api/v1/music/favorites/toggle/${trackId}`)
      
      // Should be 401 without auth
      response.assertStatus(401)
    }
  })

  test('GET /api/v1/music/favorites (requires auth)', async ({ client }) => {
    // This test should fail without auth
    const response = await client.get('/api/v1/music/favorites')
    
    // Should be 401 without auth
    response.assertStatus(401)
  })
})

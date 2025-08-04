import { test } from '@japa/runner'
import { AuthService } from '../../app/modules/auth/services/auth_service.js'

test.group('Journal Routes', (group) => {
  let authToken: string

  group.setup(async () => {
    // Create a test user and get auth token
    const loginResult = await AuthService.login({
      email: 'test@pulsezen.com',
      password: 'password123'
    })
    
    if (loginResult.success && loginResult.token) {
      authToken = loginResult.token
    }
  })

  test('GET /api/v1/journal/prompts - should get journal prompts without auth', async ({ client, assert }) => {
    const response = await client.get('/api/v1/journal/prompts')
    
    response.assertStatus(200)
    const body = response.body()
    
    assert.isTrue(body.success)
    assert.exists(body.data)
    assert.isArray(body.data)
    assert.exists(body.message)
  })

  test('GET /api/v1/journal/prompts - should filter prompts by category', async ({ client, assert }) => {
    const response = await client.get('/api/v1/journal/prompts').qs({
      category: 'mindfulness'
    })
    
    response.assertStatus(200)
    const body = response.body()
    
    assert.isTrue(body.success)
    assert.exists(body.data)
    assert.isArray(body.data)
  })

  test('GET /api/v1/journal - should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/journal')
    
    response.assertStatus(401)
  })

  test('GET /api/v1/journal - should get user entries with auth', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/journal')
      .header('Authorization', `Bearer ${authToken}`)
    
    response.assertStatus(200)
    const body = response.body()
    
    assert.isTrue(body.success)
    assert.exists(body.data)
    assert.exists(body.data.entries)
    assert.exists(body.data.total)
    assert.exists(body.data.hasMore)
    assert.isArray(body.data.entries)
  })

  test('GET /api/v1/journal - should support pagination', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/journal')
      .header('Authorization', `Bearer ${authToken}`)
      .qs({
        page: 1,
        limit: 5
      })
    
    response.assertStatus(200)
    const body = response.body()
    
    assert.isTrue(body.success)
    assert.exists(body.data)
    assert.isArray(body.data.entries)
  })

  test('POST /api/v1/journal - should create new journal entry', async ({ client, assert }) => {
    const entryData = {
      title: 'Test Journal Entry',
      content: 'This is a test journal entry with meaningful content that should be long enough to test the word count and reading time calculations.',
      category: 'reflection'
    }

    const response = await client
      .post('/api/v1/journal')
      .header('Authorization', `Bearer ${authToken}`)
      .json(entryData)
    
    response.assertStatus(201)
    const body = response.body()
    
    assert.isTrue(body.success)
    assert.exists(body.data)
    assert.exists(body.data.id)
    assert.equal(body.data.title, entryData.title)
    assert.equal(body.data.content, entryData.content)
    assert.equal(body.data.category, entryData.category)
    assert.exists(body.message)
  })

  test('POST /api/v1/journal - should validate required fields', async ({ client, assert }) => {
    const invalidData = {
      title: 'Test Entry'
      // Missing required content field
    }

    const response = await client
      .post('/api/v1/journal')
      .header('Authorization', `Bearer ${authToken}`)
      .json(invalidData)
    
    response.assertStatus(422)
    const body = response.body()
    
    assert.isFalse(body.success)
    assert.exists(body.errors)
  })

  test('POST /api/v1/journal - should validate content length', async ({ client, assert }) => {
    const invalidData = {
      content: '' // Empty content should fail validation
    }

    const response = await client
      .post('/api/v1/journal')
      .header('Authorization', `Bearer ${authToken}`)
      .json(invalidData)
    
    response.assertStatus(422)
    const body = response.body()
    
    assert.isFalse(body.success)
    assert.exists(body.errors)
  })

  test('GET /api/v1/journal/:id - should get specific entry', async ({ client }) => {
    const entryId = 'test-entry-id'
    
    const response = await client
      .get(`/api/v1/journal/${entryId}`)
      .header('Authorization', `Bearer ${authToken}`)
    
    // In mock implementation, should return 404 for non-existent entry
    response.assertStatus(404)
  })

  test('PUT /api/v1/journal/:id - should update entry', async ({ client }) => {
    const entryId = 'test-entry-id'
    const updateData = {
      title: 'Updated Title',
      content: 'Updated content with more meaningful text for testing purposes.'
    }

    const response = await client
      .put(`/api/v1/journal/${entryId}`)
      .header('Authorization', `Bearer ${authToken}`)
      .json(updateData)
    
    // In mock implementation, should return 404 for non-existent entry
    response.assertStatus(404)
  })

  test('DELETE /api/v1/journal/:id - should delete entry', async ({ client }) => {
    const entryId = 'test-entry-id'

    const response = await client
      .delete(`/api/v1/journal/${entryId}`)
      .header('Authorization', `Bearer ${authToken}`)
    
    // In mock implementation, should return 404 for non-existent entry
    response.assertStatus(404)
  })

  test('GET /api/v1/journal/stats - should get user statistics', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/journal/stats')
      .header('Authorization', `Bearer ${authToken}`)
    
    response.assertStatus(200)
    const body = response.body()
    
    assert.isTrue(body.success)
    assert.exists(body.data)
    assert.exists(body.data.totalEntries)
    assert.exists(body.data.currentStreak)
    assert.exists(body.data.totalWords)
    assert.exists(body.data.averageWordsPerEntry)
    assert.exists(body.message)
  })

  test('GET /api/v1/journal/search - should search entries', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/journal/search')
      .header('Authorization', `Bearer ${authToken}`)
      .qs({
        q: 'test search query'
      })
    
    response.assertStatus(200)
    const body = response.body()
    
    assert.isTrue(body.success)
    assert.exists(body.data)
    assert.isArray(body.data)
  })

  test('GET /api/v1/journal/search - should require search parameter', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/journal/search')
      .header('Authorization', `Bearer ${authToken}`)
    
    response.assertStatus(400)
    const body = response.body()
    
    assert.isFalse(body.success)
    assert.exists(body.message)
  })

  test('Authorization header validation', async ({ client }) => {
    // Test missing header
    const response1 = await client.get('/api/v1/journal')
    response1.assertStatus(401)

    // Test invalid format
    const response2 = await client
      .get('/api/v1/journal')
      .header('Authorization', 'InvalidFormat')
    response2.assertStatus(401)

    // Test invalid token
    const response3 = await client
      .get('/api/v1/journal')
      .header('Authorization', 'Bearer invalid.token.here')
    response3.assertStatus(401)
  })
})

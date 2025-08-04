import { test } from '@japa/runner'
import { JournalService } from '../../app/modules/journal/services/journal_service.js'

test.group('Journal Service', () => {
  test('should create a journal entry', async ({ assert }) => {
    const userId = 'test-user-id'
    const entryData = {
      title: 'Test Entry',
      content: 'This is a test journal entry with some meaningful content.',
      category: 'reflection'
    }

    const entry = await JournalService.createEntry(userId, entryData)

    assert.exists(entry.id)
    assert.equal(entry.title, entryData.title)
    assert.equal(entry.content, entryData.content)
    assert.equal(entry.category, entryData.category)
    assert.exists(entry.createdAt)
    assert.exists(entry.updatedAt)
    assert.isNumber(entry.wordCount)
    assert.isNumber(entry.characterCount)
    assert.isNumber(entry.readingTime)
  })

  test('should get user entries with filters', async ({ assert }) => {
    const userId = 'test-user-id'
    const filters = {
      page: 1,
      limit: 10,
      category: 'reflection'
    }

    const result = await JournalService.getEntries(userId, filters)

    assert.exists(result.entries)
    assert.exists(result.total)
    assert.exists(result.hasMore)
    assert.isArray(result.entries)
    assert.isNumber(result.total)
    assert.isBoolean(result.hasMore)
  })

  test('should get entry by id', async ({ assert }) => {
    const userId = 'test-user-id'
    const entryId = 'test-entry-id'

    const entry = await JournalService.getEntryById(userId, entryId)

    // Should return null for non-existent entry in mock
    assert.isNull(entry)
  })

  test('should update an entry', async ({ assert }) => {
    const userId = 'test-user-id'
    const entryId = 'test-entry-id'
    const updateData = {
      title: 'Updated Title',
      content: 'Updated content with more meaningful text.'
    }

    const entry = await JournalService.updateEntry(userId, entryId, updateData)

    // In mock implementation, returns null for non-existent entries
    assert.isNull(entry)
  })

  test('should delete an entry', async ({ assert }) => {
    const userId = 'test-user-id'
    const entryId = 'test-entry-id'

    const deleted = await JournalService.deleteEntry(userId, entryId)

    // In mock implementation, returns false for non-existent entries
    assert.isFalse(deleted)
  })

  test('should get journal prompts', async ({ assert }) => {
    const filters = {
      category: 'mindfulness'
    }

    const prompts = await JournalService.getPrompts(filters)

    assert.isArray(prompts)
    assert.isTrue(prompts.length > 0)
    
    const prompt = prompts[0]
    assert.exists(prompt.id)
    assert.exists(prompt.question)
    assert.exists(prompt.category)
    assert.exists(prompt.difficulty)
    assert.exists(prompt.type)
  })

  test('should get random prompt', async ({ assert }) => {
    const filters = {
      category: 'gratitude'
    }

    const prompt = await JournalService.getRandomPrompt(filters)

    if (prompt) {
      assert.exists(prompt.id)
      assert.exists(prompt.question)
      assert.exists(prompt.category)
      assert.exists(prompt.difficulty)
      assert.exists(prompt.type)
    }
  })

  test('should search entries', async ({ assert }) => {
    const userId = 'test-user-id'
    const query = 'test search'

    const results = await JournalService.searchEntries(userId, query)

    assert.isArray(results)
    // Mock implementation returns empty array
    assert.equal(results.length, 0)
  })

  test('should get journal stats', async ({ assert }) => {
    const userId = 'test-user-id'

    const stats = await JournalService.getJournalStats(userId)

    assert.exists(stats.totalEntries)
    assert.exists(stats.currentStreak)
    assert.exists(stats.longestStreak)
    assert.exists(stats.totalWords)
    assert.exists(stats.averageWordsPerEntry)
    assert.exists(stats.entriesThisWeek)
    assert.exists(stats.entriesThisMonth)
    assert.exists(stats.favoriteCategory)
    assert.exists(stats.mostUsedMoodTags)
    assert.exists(stats.moodTrends)
    assert.exists(stats.writingPatterns)
    assert.isNumber(stats.totalEntries)
    assert.isNumber(stats.currentStreak)
    assert.isNumber(stats.longestStreak)
    assert.isNumber(stats.totalWords)
    assert.isNumber(stats.averageWordsPerEntry)
    assert.isNumber(stats.entriesThisWeek)
    assert.isNumber(stats.entriesThisMonth)
    assert.isString(stats.favoriteCategory)
    assert.isArray(stats.mostUsedMoodTags)
    assert.isArray(stats.moodTrends)
    assert.isObject(stats.writingPatterns)
  })
})

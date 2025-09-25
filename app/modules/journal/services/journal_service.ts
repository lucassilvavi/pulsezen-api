import JournalEntry from '#models/journal_entry'
import { DateTime } from 'luxon'

export class JournalService {
  
  static async getPrompts(_filters?: any) {
    // Journal prompts (this can stay as static data for now)
    return [
      {
        id: '1',
        question: 'Como você se sente hoje?',
        category: 'Reflexão',
        difficulty: 'easy',
        type: 'standard',
        estimatedTime: 5,
        tags: ['humor', 'reflexão'],
        benefits: ['Autoconhecimento'],
        isPremium: false
      },
      {
        id: '2', 
        question: 'O que você aprendeu hoje?',
        category: 'Crescimento',
        difficulty: 'medium',
        type: 'guided',
        estimatedTime: 10,
        tags: ['aprendizado', 'crescimento'],
        benefits: ['Desenvolvimento pessoal'],
        isPremium: false
      },
      {
        id: '3',
        question: 'Descreva um momento que te fez sorrir hoje.',
        category: 'Gratidão',
        difficulty: 'easy',
        type: 'standard',
        estimatedTime: 5,
        tags: ['gratidão', 'positividade'],
        benefits: ['Bem-estar emocional'],
        isPremium: false
      }
    ]
  }

  static async getEntries(userId: string, filters?: any) {
    try {
      const query = JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')

      // Apply pagination
      if (filters?.limit) {
        query.limit(filters.limit)
      }
      if (filters?.offset) {
        query.offset(filters.offset)
      }

      // Apply category filter
      if (filters?.category) {
        query.where('prompt_category', filters.category)
      }

      // Apply favorite filter
      if (filters?.isFavorite !== undefined) {
        query.where('is_favorite', filters.isFavorite)
      }

      // Apply date filters
      if (filters?.startDate) {
        query.where('created_at', '>=', filters.startDate)
      }
      if (filters?.endDate) {
        query.where('created_at', '<=', filters.endDate)
      }

      // Apply search filter
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        query.where((builder) => {
          builder
            .where('content', 'ILIKE', searchTerm)
            .orWhereJsonSuperset('mood_tags', [filters.search.toLowerCase()])
            .orWhereJsonPath('metadata', '$.title', 'ILIKE', searchTerm)
        })
      }

      // Apply privacy level filter
      if (filters?.privacyLevel) {
        query.where('privacy_level', filters.privacyLevel)
      }

      // Apply mood tags filter
      if (filters?.moodTags && Array.isArray(filters.moodTags)) {
        query.whereJsonSuperset('mood_tags', filters.moodTags)
      }

      // Apply word count range filter
      if (filters?.minWords) {
        query.where('word_count', '>=', parseInt(filters.minWords))
      }
      if (filters?.maxWords) {
        query.where('word_count', '<=', parseInt(filters.maxWords))
      }

      const entries = await query.exec()
      return entries
    } catch (error) {
      console.error('Error fetching entries:', error)
      return []
    }
  }

  static async createEntry(userId: string, data: any) {
    try {
      const entry = await JournalEntry.create({
        userId,
        content: data.content,
        wordCount: data.content ? data.content.split(' ').length : 0,
        readingTimeMinutes: Math.ceil((data.content?.length || 0) / 200),
        promptId: data.promptId || null,
        promptCategory: data.promptCategory || 'general',
        customPrompt: data.customPrompt || null,
        moodTags: data.moodTags || data.tags || [],
        sentimentScore: data.sentimentScore || null,
        isFavorite: data.isFavorite || false,
        privacyLevel: data.privacyLevel || 'private',
        metadata: {
          ...data.metadata || {},
          // Legacy compatibility
          title: data.title || 'Entrada sem título',
          mood: data.mood,
          emotions: data.emotions || { joy: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, surprise: 0.1, disgust: 0.1 },
          keywords: data.keywords || [],
          themes: data.themes || [],
          characterCount: data.content ? data.content.length : 0
        }
      })

      return entry
    } catch (error) {
      console.error('Error creating entry:', error)
      throw error
    }
  }

  static async getEntryById(userId: string, entryId: string) {
    try {
      const entry = await JournalEntry.query()
        .where('id', entryId)
        .where('user_id', userId)
        .whereNull('deleted_at')
        .first()

      return entry || null
    } catch (error) {
      console.error('Error fetching entry by ID:', error)
      return null
    }
  }

  static async updateEntry(userId: string, entryId: string, data: any) {
    try {
      const entry = await JournalEntry.query()
        .where('id', entryId)
        .where('user_id', userId)
        .whereNull('deleted_at')
        .first()

      if (!entry) return null

      // Update fields
      if (data.content !== undefined) {
        entry.content = data.content
        entry.wordCount = data.content.split(' ').length
        entry.readingTimeMinutes = Math.ceil(data.content.length / 200)
      }
      
      if (data.promptId !== undefined) entry.promptId = data.promptId
      if (data.promptCategory !== undefined) entry.promptCategory = data.promptCategory
      if (data.customPrompt !== undefined) entry.customPrompt = data.customPrompt
      if (data.moodTags !== undefined) entry.moodTags = data.moodTags
      if (data.tags !== undefined) entry.moodTags = data.tags // Legacy compatibility
      if (data.sentimentScore !== undefined) entry.sentimentScore = data.sentimentScore
      if (data.isFavorite !== undefined) entry.isFavorite = data.isFavorite
      if (data.privacyLevel !== undefined) entry.privacyLevel = data.privacyLevel
      
      // Update metadata
      if (data.metadata || data.title || data.mood || data.emotions) {
        entry.metadata = {
          ...entry.metadata || {},
          ...data.metadata || {},
          ...(data.title && { title: data.title }),
          ...(data.mood && { mood: data.mood }),
          ...(data.emotions && { emotions: data.emotions }),
          ...(data.keywords && { keywords: data.keywords }),
          ...(data.themes && { themes: data.themes })
        }
      }

      await entry.save()
      return entry
    } catch (error) {
      console.error('Error updating entry:', error)
      return null
    }
  }

  static async deleteEntry(userId: string, entryId: string) {
    try {
      const entry = await JournalEntry.query()
        .where('id', entryId)
        .where('user_id', userId)
        .whereNull('deleted_at')
        .first()

      if (!entry) return false

      // Soft delete
      entry.deletedAt = DateTime.now()
      await entry.save()
      return true
    } catch (error) {
      console.error('Error deleting entry:', error)
      return false
    }
  }

  static async searchEntries(userId: string, query: string, filters?: any) {
    try {
      const dbQuery = JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .where('content', 'ILIKE', `%${query}%`)
        .orderBy('created_at', 'desc')

      if (filters?.limit) {
        dbQuery.limit(filters.limit)
      }

      const entries = await dbQuery.exec()
      return entries
    } catch (error) {
      console.error('Error searching entries:', error)
      return []
    }
  }

  static async getJournalStats(userId: string) {
    try {
      const entries = await JournalEntry.query()
        .where('user_id', userId)
        .whereNull('deleted_at')
        .select(['word_count', 'created_at'])

      const uniqueDays = new Set(
        entries.map(entry => entry.createdAt.toFormat('yyyy-MM-dd'))
      ).size

      const totalWords = entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0)

      return {
        totalEntries: entries.length,
        uniqueDays,
        averageWordsPerEntry: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
        totalWords
      }
    } catch (error) {
      console.error('Error getting journal stats:', error)
      return {
        totalEntries: 0,
        uniqueDays: 0,
        averageWordsPerEntry: 0,
        totalWords: 0
      }
    }
  }
}

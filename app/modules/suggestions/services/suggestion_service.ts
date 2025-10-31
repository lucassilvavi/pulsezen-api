import { DateTime } from 'luxon'
import Suggestion, { SuggestionCategory } from '#modules/suggestions/models/suggestion'

// Simple in-memory storage for ratings (in production this would be in database)
const ratingsStorage = new Map<string, number>();
import { StructuredLogger } from '#services/structured_logger'

// Response types
export interface DailySuggestionsResponse {
  success: boolean
  data?: {
    date: string
    suggestions: Array<{
      id: string
      title: string
      summary: string
      category: SuggestionCategory
      estimatedReadTime: number
      imageUrl: string | null
      isRead: boolean
      userSuggestionId: string
    }>
  }
  message?: string
}

export interface MarkAsReadResponse {
  success: boolean
  message: string
}

export interface RateSuggestionResponse {
  success: boolean
  message: string
}

export interface StatsResponse {
  success: boolean
  data?: {
    totalAssigned: number
    totalRead: number
    averageRating: number
    readingStreak: number
    favoriteCategory: SuggestionCategory | null
  }
  message?: string
}

export default class SuggestionService {
  /**
   * Get daily suggestions for a user (4 suggestions per day)
   */
  static async getDailySuggestions(userId: string, date?: string): Promise<DailySuggestionsResponse> {
    try {
      const targetDate = date ? DateTime.fromISO(date) : DateTime.now()
      const dateString = targetDate.toISODate()

      if (!dateString) {
        return {
          success: false,
          message: 'Data inválida fornecida'
        }
      }

      // Fetch 4 random active suggestions from the database
      const suggestions = await Suggestion
        .query()
        .where('isActive', true)
        .orderByRaw('RANDOM()')
        .limit(4)

      // Map to response format
      const mappedSuggestions = suggestions.map((suggestion) => ({
        id: suggestion.id,
        title: suggestion.title,
        summary: suggestion.summary,
        category: suggestion.category,
        estimatedReadTime: suggestion.estimatedReadTime,
        imageUrl: suggestion.imageUrl,
        isRead: false, // TODO: Check user's read status when user_suggestions table is implemented
        userSuggestionId: suggestion.id // TODO: Use actual user_suggestion_id when table is implemented
      }))

      StructuredLogger.info('Daily suggestions generated successfully from database', {
        userId,
        date: dateString,
        suggestionsCount: mappedSuggestions.length
      })

      return {
        success: true,
        data: {
          date: dateString,
          suggestions: mappedSuggestions
        }
      }
    } catch (error) {
      StructuredLogger.error('Error retrieving daily suggestions', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Get a specific suggestion by ID
   */
  static async getSuggestionById(suggestionId: string, _userId: string): Promise<{
    success: boolean
    data?: {
      id: string
      title: string
      content: string
      summary: string
      category: SuggestionCategory
      estimatedReadTime: number
      imageUrl: string | null
      isRead: boolean
      userSuggestionId: string
      rating?: number
    }
    message?: string
  }> {
    try {
      // Fetch suggestion from database
      const suggestion = await Suggestion.find(suggestionId)
      
      if (!suggestion || !suggestion.isActive) {
        return {
          success: false,
          message: 'Sugestão não encontrada'
        }
      }

      // Check if there's a stored rating for this user suggestion
      const storedRating = ratingsStorage.get(suggestionId)
      
      StructuredLogger.info('Suggestion retrieved by ID from database', {
        userId: _userId,
        suggestionId,
        title: suggestion.title
      })

      return {
        success: true,
        data: {
          id: suggestion.id,
          title: suggestion.title,
          content: suggestion.content,
          summary: suggestion.summary,
          category: suggestion.category,
          estimatedReadTime: suggestion.estimatedReadTime,
          imageUrl: suggestion.imageUrl,
          isRead: false, // TODO: Check user's read status when user_suggestions table is implemented
          userSuggestionId: suggestion.id, // TODO: Use actual user_suggestion_id when table is implemented
          rating: storedRating || undefined
        }
      }
    } catch (error) {
      StructuredLogger.error('Error retrieving suggestion by ID', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Mark suggestion as read (mock implementation)
   */
  static async markAsRead(userSuggestionId: string, userId: string): Promise<MarkAsReadResponse> {
    try {
      StructuredLogger.info('Suggestion marked as read (mock)', {
        userSuggestionId,
        userId
      })

      return {
        success: true,
        message: 'Sugestão marcada como lida'
      }
    } catch (error) {
      StructuredLogger.error('Error marking suggestion as read', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Rate a suggestion (mock implementation)
   */
  static async rateSuggestion(userSuggestionId: string, userId: string, rating: number): Promise<RateSuggestionResponse> {
    try {
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          message: 'Avaliação deve estar entre 1 e 5'
        }
      }

      // Store the rating in memory (in production this would be saved to database)
      ratingsStorage.set(userSuggestionId, rating)

      StructuredLogger.info('Suggestion rated (mock)', {
        userSuggestionId,
        userId,
        rating
      })

      return {
        success: true,
        message: 'Avaliação registrada com sucesso'
      }
    } catch (error) {
      StructuredLogger.error('Error rating suggestion', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }

  /**
   * Get user suggestion statistics (mock implementation)
   */
  static async getStats(userId: string): Promise<StatsResponse> {
    try {
      StructuredLogger.info('Getting suggestion stats (mock)', { userId })

      return {
        success: true,
        data: {
          totalAssigned: 12,
          totalRead: 8,
          averageRating: 4.2,
          readingStreak: 3,
          favoriteCategory: 'mindfulness'
        }
      }
    } catch (error) {
      StructuredLogger.error('Error getting suggestion stats', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  }
}
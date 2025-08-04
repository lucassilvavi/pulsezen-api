// Request DTOs
export interface CreateJournalEntryDto {
  title?: string
  content: string
  promptId?: string
  customPrompt?: string
  moodTagIds?: string[]
  category?: string
  subcategory?: string
  privacy?: {
    level: 'private' | 'shared' | 'public'
    shareWithTherapist: boolean
  }
  metadata?: {
    deviceType: 'phone' | 'tablet' | 'web'
    timezone: string
    location?: {
      city: string
      country: string
    }
    writingSession: {
      startTime: string
      endTime: string
      pauseCount: number
      revisionCount: number
    }
  }
}

export interface UpdateJournalEntryDto {
  title?: string
  content?: string
  moodTagIds?: string[]
  category?: string
  subcategory?: string
  privacy?: {
    level: 'private' | 'shared' | 'public'
    shareWithTherapist: boolean
  }
}

export interface GetEntriesFiltersDto {
  limit?: number
  offset?: number
  page?: number
  startDate?: string
  endDate?: string
  category?: string
  search?: string
  moodTags?: string[]
}

export interface GetPromptsFiltersDto {
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  type?: 'standard' | 'guided' | 'creative' | 'therapeutic'
  language?: string
  excludeUsed?: boolean
}

// Response DTOs
export interface JournalEntryResponseDto {
  id: string
  title?: string
  content: string
  prompt?: {
    id: string
    question: string
    category: string
  }
  customPrompt?: string
  moodTags: {
    id: string
    emoji: string
    label: string
    color: string
    category: string
    intensity: number
  }[]
  category: string
  subcategory?: string
  wordCount: number
  characterCount: number
  readingTime: number
  sentiment?: {
    score: number
    label: string
    confidence: number
  }
  emotions?: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
  }
  keywords: string[]
  themes: string[]
  privacy: {
    level: string
    shareWithTherapist: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface JournalPromptResponseDto {
  id: string
  question: string
  category: string
  subcategory?: string
  difficulty: string
  type: string
  estimatedTime: number
  benefits: string[]
  instructions?: string[]
  tags: string[]
  icon?: string
  isPremium: boolean
}

export interface JournalStatsResponseDto {
  totalEntries: number
  currentStreak: number
  longestStreak: number
  totalWords: number
  averageWordsPerEntry: number
  entriesThisWeek: number
  entriesThisMonth: number
  favoriteCategory: string
  mostUsedMoodTags: {
    id: string
    emoji: string
    label: string
    count: number
  }[]
  moodTrends: {
    date: string
    averageMood: number
    entries: number
  }[]
  writingPatterns: {
    hourOfDay: { [hour: string]: number }
    dayOfWeek: { [day: string]: number }
    wordsPerDay: { [date: string]: number }
  }
}

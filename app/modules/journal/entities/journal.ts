export interface JournalPrompt {
  id: string
  question: string
  category: string
  subcategory?: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'standard' | 'guided' | 'creative' | 'therapeutic'
  estimatedTime: number // em minutos
  benefits: string[]
  instructions?: string[]
  tags: string[]
  icon?: string
  isActive: boolean
  isPremium: boolean
  language: string
  popularityScore: number
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface MoodTag {
  id: string
  emoji: string
  label: string
  value: string
  color: string
  category: 'positive' | 'negative' | 'neutral'
  intensity: 1 | 2 | 3 | 4 | 5
  language: string
  isActive: boolean
  createdAt: Date
}

export interface JournalEntry {
  id: string
  userId: string
  title?: string
  content: string
  promptId?: string
  customPrompt?: string
  category: string
  subcategory?: string
  wordCount: number
  characterCount: number
  readingTime: number // em segundos
  sentiment?: {
    score: number // -1 to 1
    label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive'
    confidence: number // 0 to 1
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
  moodTagIds: string[]
  privacy: {
    level: 'private' | 'shared' | 'public'
    shareWithTherapist: boolean
  }
  metadata: {
    deviceType: 'phone' | 'tablet' | 'web'
    timezone: string
    location?: {
      city: string
      country: string
    }
    writingSession: {
      startTime: Date
      endTime: Date
      pauseCount: number
      revisionCount: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

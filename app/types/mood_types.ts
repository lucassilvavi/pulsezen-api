/**
 * Types for the Mood module
 * Shared between controllers, services, and validators
 */

export type MoodLevel = 'excelente' | 'bem' | 'neutro' | 'mal' | 'pessimo'
export type MoodPeriod = 'manha' | 'tarde' | 'noite'

// Request/Response interfaces
export interface MoodEntryRequest {
  mood_level: MoodLevel
  period: MoodPeriod
  date: string // YYYY-MM-DD format
  notes?: string
  activities?: string[]
  emotions?: string[]
}

export interface MoodEntryResponse {
  id: string
  user_id: string
  mood_level: MoodLevel
  period: MoodPeriod
  date: string
  timestamp: number
  notes: string | null
  activities: string[] | null
  emotions: string[] | null
  created_at: string
  updated_at: string
}

export interface MoodStatsResponse {
  average_mood: number
  total_entries: number
  mood_distribution: Record<MoodLevel, number>
  period_distribution: Record<MoodPeriod, number>
  streak: number
  last_entry?: MoodEntryResponse
}

export interface MoodTrendResponse {
  date: string
  mood: number
  entries_count: number
}

export interface MoodStatsQuery {
  days?: number
  period?: MoodPeriod
}

// Internal service types
export interface CreateMoodEntryData {
  userId: string
  moodLevel: MoodLevel
  period: MoodPeriod
  date: string
  timestamp?: number
  notes?: string
  activities?: string[]
  emotions?: string[]
}

export interface MoodEntryFilters {
  date?: string
  period?: MoodPeriod
  moodLevel?: MoodLevel
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

// Constants
export const MOOD_VALUES: Record<MoodLevel, number> = {
  'pessimo': 1,
  'mal': 2,
  'neutro': 3,
  'bem': 4,
  'excelente': 5
}

export const PERIOD_HOURS = {
  manha: { start: 5, end: 12 },
  tarde: { start: 12, end: 18 },
  noite: { start: 18, end: 29 } // 29 to include early morning hours
}

export const MOOD_LEVELS: MoodLevel[] = ['excelente', 'bem', 'neutro', 'mal', 'pessimo']
export const MOOD_PERIODS: MoodPeriod[] = ['manha', 'tarde', 'noite']

/**
 * Types for the Journal module
 * Unified types shared between frontend and backend
 */

// Core Mood Tag Interface
export interface MoodTag {
  id: string;
  label: string;
  emoji: string;
  category: 'positive' | 'negative' | 'neutral';
  intensity: 1 | 2 | 3 | 4 | 5;
  hexColor: string;
}

// Enhanced Journal Prompt Interface
export interface JournalPrompt {
  id: string;
  question: string;
  category: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimatedTime?: number;       // em minutos
  isPersonalized?: boolean;     // Para prompts gerados por IA
  type?: 'standard' | 'guided' | 'creative' | 'therapeutic';
}

// Journal Entry Metadata
export interface JournalEntryMetadata {
  deviceType?: string;
  timezone?: string;
  writingDuration?: number;   // em segundos
  revisionCount?: number;
  appVersion?: string;
  location?: {
    city: string;
    country: string;
  };
  writingSession?: {
    startTime: string;
    endTime: string;
    pauseCount: number;
  };
}

// Request types for API
export interface CreateJournalEntryRequest {
  content: string;
  promptId?: string;
  promptCategory: string;
  customPrompt?: string;
  moodTags: MoodTag[];
  privacyLevel?: 'private' | 'shared' | 'anonymous';
  metadata?: JournalEntryMetadata;
}

export interface UpdateJournalEntryRequest {
  content?: string;
  promptId?: string;
  promptCategory?: string;
  customPrompt?: string;
  moodTags?: MoodTag[];
  privacyLevel?: 'private' | 'shared' | 'anonymous';
  isFavorite?: boolean;
  metadata?: JournalEntryMetadata;
}

// Response types for API
export interface JournalEntryResponse {
  id: string;
  userId: string;
  content: string;
  wordCount: number;
  readingTimeMinutes: number;
  promptId: string | null;
  promptCategory: string;
  customPrompt: string | null;
  moodTags: MoodTag[];
  sentimentScore: number | null;
  isFavorite: boolean;
  privacyLevel: 'private' | 'shared' | 'anonymous';
  metadata: JournalEntryMetadata;
  createdAt: string;
  updatedAt: string;
}

// Stats and analytics types
export interface JournalStatsResponse {
  totalEntries: number;
  uniqueDays: number;
  averageWordsPerEntry: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategories: { category: string; count: number }[];
  moodDistribution: { mood: string; percentage: number }[];
  sentimentTrend: { date: string; score: number }[];
}

// Filter types
export interface JournalEntryFilters {
  dateRange?: { start: string; end: string };
  categories?: string[];
  moodTags?: string[];
  sentimentRange?: { min: number; max: number };
  privacyLevel?: ('private' | 'shared' | 'anonymous')[];
  isFavorite?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

// Internal service types
export interface CreateJournalEntryData {
  userId: string;
  content: string;
  promptId?: string;
  promptCategory: string;
  customPrompt?: string;
  moodTags: MoodTag[];
  privacyLevel: 'private' | 'shared' | 'anonymous';
  metadata: JournalEntryMetadata;
}

// Constants
export const PRIVACY_LEVELS = ['private', 'shared', 'anonymous'] as const;
export const MOOD_CATEGORIES = ['positive', 'negative', 'neutral'] as const;
export const PROMPT_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export const PROMPT_TYPES = ['standard', 'guided', 'creative', 'therapeutic'] as const;

// Helper functions
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function calculateSentimentScore(content: string): number {
  // Simplified sentiment analysis - could be enhanced with AI
  const positiveWords = ['feliz', 'alegre', 'bem', 'ótimo', 'excelente', 'grato', 'amor', 'paz'];
  const negativeWords = ['triste', 'ansioso', 'preocupado', 'mal', 'deprimido', 'nervoso', 'medo', 'raiva'];
  
  const words = content.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) return 0;
  
  return Number(((positiveCount - negativeCount) / totalSentimentWords).toFixed(2));
}

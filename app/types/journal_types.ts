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
  // Enhanced sentiment analysis with comprehensive Portuguese word lists
  const positiveWords = [
    'feliz', 'alegre', 'bem', 'ótimo', 'excelente', 'grato', 'amor', 'paz',
    'otimo', 'bom', 'boa', 'maravilhoso', 'maravilhosa', 'incrível', 'perfeito',
    'perfeita', 'animado', 'animada', 'motivado', 'motivada', 'esperança',
    'esperancoso', 'confiante', 'tranquilo', 'tranquila', 'calmo', 'calma',
    'relaxado', 'relaxada', 'satisfeito', 'satisfeita', 'realizado', 'realizada',
    'sucesso', 'vitória', 'conquista', 'alegria', 'felicidade', 'gratidão',
    'lindo', 'linda', 'bonito', 'bonita', 'positivo', 'positiva', 'agradecido',
    'agradecida', 'orgulhoso', 'orgulhosa', 'aliviado', 'aliviada', 'melhor'
  ];
  
  const negativeWords = [
    'triste', 'ansioso', 'ansiosa', 'preocupado', 'preocupada', 'mal', 'deprimido',
    'deprimida', 'nervoso', 'nervosa', 'medo', 'raiva', 'irritado', 'irritada',
    'suicidio', 'suicídio', 'suicida', 'morte', 'morrer', 'acabar', 'desistir',
    'pessimo', 'péssimo', 'péssima', 'horrível', 'terrível', 'ruim',
    'vazio', 'vazia', 'sozinho', 'sozinha', 'abandonado', 'abandonada',
    'estressado', 'estressada', 'cansado', 'cansada', 'exausto', 'exausta',
    'frustrado', 'frustrada', 'decepcionado', 'decepcionada', 'desesperado',
    'desesperada', 'desespero', 'angústia', 'angustia', 'sofrimento', 'sofrer',
    'dor', 'doloroso', 'dolorosa', 'trágico', 'trágica', 'trauma', 'traumático',
    'traumática', 'assustado', 'assustada', 'pavor', 'pânico', 'panico',
    'inseguro', 'insegura', 'fraco', 'fraca', 'impotente', 'incapaz',
    'fracasso', 'falha', 'perder', 'perdido', 'perdida', 'confuso', 'confusa',
    'culpa', 'culpado', 'culpada', 'vergonha', 'arrependido', 'arrependida',
    'chorar', 'choro', 'lágrima', 'lagrima', 'solidão', 'solidao', 'isolado',
    'isolada', 'rejeitado', 'rejeitada', 'magoado', 'magoada', 'ferido', 'ferida',
    'problemas', 'dificuldade', 'difícil', 'complicado', 'complicada'
  ];
  
  // Critical words that should have stronger weight
  const criticalNegativeWords = [
    'suicidio', 'suicídio', 'suicida', 'morte', 'morrer', 'desistir',
    'desespero', 'desesperado', 'desesperada', 'acabar'
  ];
  
  const text = content.toLowerCase();
  const words = text.split(/\s+/);
  
  let positiveCount = 0;
  let negativeCount = 0;
  let criticalCount = 0;
  
  words.forEach(word => {
    // Remove punctuation for better matching
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    // Check for critical negative words first (higher weight)
    if (criticalNegativeWords.some(cw => cleanWord.includes(cw))) {
      criticalCount++;
      negativeCount += 2; // Count twice for critical words
    } else if (negativeWords.some(nw => cleanWord.includes(nw))) {
      negativeCount++;
    } else if (positiveWords.some(pw => cleanWord.includes(pw))) {
      positiveCount++;
    }
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) return 0;
  
  // Calculate base sentiment
  const baseSentiment = (positiveCount - negativeCount) / totalSentimentWords;
  
  // Apply critical word penalty
  let finalSentiment = baseSentiment;
  if (criticalCount > 0) {
    // Ensure critical words push sentiment to at least -0.8
    finalSentiment = Math.min(finalSentiment, -0.8);
  }
  
  // Clamp between -1 and 1
  finalSentiment = Math.max(-1, Math.min(1, finalSentiment));
  
  return Number(finalSentiment.toFixed(2));
}

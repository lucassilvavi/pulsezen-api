import vine from '@vinejs/vine'
import { MOOD_LEVELS, MOOD_PERIODS } from '../../../types/mood_types.js'

/**
 * Validator for creating mood entries
 */
export const createMoodEntryValidator = vine.compile(
  vine.object({
    mood_level: vine
      .enum(MOOD_LEVELS)
      .optional(), // Will be set by service if not provided

    period: vine
      .enum(MOOD_PERIODS)
      .optional(), // Will be auto-detected if not provided

    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(), // Will default to today if not provided

    notes: vine
      .string()
      .maxLength(500)
      .optional(),

    activities: vine
      .array(vine.string().maxLength(50))
      .maxLength(10)
      .optional(),

    emotions: vine
      .array(vine.string().maxLength(50))
      .maxLength(10)
      .optional()
  })
)

/**
 * Validator for updating mood entries
 */
export const updateMoodEntryValidator = vine.compile(
  vine.object({
    mood_level: vine
      .enum(MOOD_LEVELS)
      .optional(),

    notes: vine
      .string()
      .maxLength(500)
      .optional(),

    activities: vine
      .array(vine.string().maxLength(50))
      .maxLength(10)
      .optional(),

    emotions: vine
      .array(vine.string().maxLength(50))
      .maxLength(10)
      .optional()
  })
)

/**
 * Validator for mood statistics queries
 */
export const moodStatsQueryValidator = vine.compile(
  vine.object({
    days: vine
      .number()
      .min(1)
      .max(365)
      .optional(),

    period: vine
      .enum(MOOD_PERIODS)
      .optional()
  })
)

/**
 * Validator for mood entries list queries
 */
export const moodEntriesQueryValidator = vine.compile(
  vine.object({
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),

    period: vine
      .enum(MOOD_PERIODS)
      .optional(),

    mood_level: vine
      .enum(MOOD_LEVELS)
      .optional(),

    start_date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),

    end_date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),

    limit: vine
      .number()
      .min(1)
      .max(100)
      .optional(),

    offset: vine
      .number()
      .min(0)
      .optional()
  })
)

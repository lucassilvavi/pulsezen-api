import vine from '@vinejs/vine'

/**
 * Validator for creating journal entry
 */
export const createJournalEntryValidator = vine.compile(
  vine.object({
    content: vine
      .string()
      .minLength(1)
      .maxLength(50000), // 50k characters limit
    prompt_id: vine
      .string()
      .uuid()
      .optional(),
    prompt_category: vine
      .string()
      .minLength(1)
      .maxLength(100),
    custom_prompt: vine
      .string()
      .maxLength(1000)
      .optional(),
    mood_tags: vine
      .array(vine.object({
        id: vine.string(),
        label: vine.string(),
        emoji: vine.string(),
        category: vine.enum(['positive', 'negative', 'neutral']),
        intensity: vine.number().min(1).max(5),
        hexColor: vine.string()
      }))
      .optional(),
    privacy_level: vine
      .enum(['private', 'shared', 'anonymous'])
      .optional(),
    metadata: vine
      .object({
        deviceType: vine
          .string()
          .maxLength(50)
          .optional(),
        timezone: vine
          .string()
          .maxLength(50)
          .optional(),
        writingDuration: vine
          .number()
          .min(0)
          .optional(),
        revisionCount: vine
          .number()
          .min(0)
          .optional()
      })
      .optional()
  })
)

/**
 * Validator for updating journal entry
 */
export const updateJournalEntryValidator = vine.compile(
  vine.object({
    content: vine
      .string()
      .minLength(1)
      .maxLength(50000)
      .optional(),
    prompt_id: vine
      .string()
      .uuid()
      .optional(),
    prompt_category: vine
      .string()
      .minLength(1)
      .maxLength(100)
      .optional(),
    custom_prompt: vine
      .string()
      .maxLength(1000)
      .optional(),
    mood_tags: vine
      .array(vine.object({
        id: vine.string(),
        label: vine.string(),
        emoji: vine.string(),
        category: vine.enum(['positive', 'negative', 'neutral']),
        intensity: vine.number().min(1).max(5),
        hexColor: vine.string()
      }))
      .optional(),
    privacy_level: vine
      .enum(['private', 'shared', 'anonymous'])
      .optional(),
    is_favorite: vine
      .boolean()
      .optional(),
    metadata: vine
      .object({
        deviceType: vine
          .string()
          .maxLength(50)
          .optional(),
        timezone: vine
          .string()
          .maxLength(50)
          .optional(),
        writingDuration: vine
          .number()
          .min(0)
          .optional(),
        revisionCount: vine
          .number()
          .min(0)
          .optional()
      })
      .optional()
  })
)

/**
 * Validator for entry filters
 */
export const journalEntriesQueryValidator = vine.compile(
  vine.object({
    limit: vine
      .number()
      .min(1)
      .max(100)
      .optional(),
    offset: vine
      .number()
      .min(0)
      .optional(),
    start_date: vine
      .string()
      .optional(), // ISO date string
    end_date: vine
      .string()
      .optional(), // ISO date string
    categories: vine
      .string() // comma-separated
      .optional(),
    privacy_level: vine
      .string() // comma-separated
      .optional(),
    is_favorite: vine
      .boolean()
      .optional(),
    search: vine
      .string()
      .maxLength(500)
      .optional(),
    sentiment_min: vine
      .number()
      .min(-1)
      .max(1)
      .optional(),
    sentiment_max: vine
      .number()
      .min(-1)
      .max(1)
      .optional()
  })
)

/**
 * Validator for journal stats request
 */
export const journalStatsValidator = vine.compile(
  vine.object({
    days: vine
      .number()
      .min(1)
      .max(365)
      .optional()
  })
)

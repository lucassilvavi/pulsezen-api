import vine from '@vinejs/vine'

/**
 * Validator for creating journal entry
 */
export const createJournalEntryValidator = vine.compile(
  vine.object({
    title: vine
      .string()
      .maxLength(500)
      .optional(),
    content: vine
      .string()
      .minLength(1)
      .maxLength(50000), // 50k characters limit
    promptId: vine
      .string()
      .uuid()
      .optional(),
    customPrompt: vine
      .string()
      .maxLength(1000)
      .optional(),
    moodTagIds: vine
      .array(vine.string().uuid())
      .optional(),
    category: vine
      .string()
      .maxLength(100)
      .optional(),
    subcategory: vine
      .string()
      .maxLength(100)
      .optional(),
    privacy: vine
      .object({
        level: vine
          .enum(['private', 'shared', 'public']),
        shareWithTherapist: vine
          .boolean()
      })
      .optional(),
    metadata: vine
      .object({
        deviceType: vine
          .enum(['phone', 'tablet', 'web']),
        timezone: vine
          .string()
          .maxLength(50),
        location: vine
          .object({
            city: vine.string().maxLength(100),
            country: vine.string().maxLength(100)
          })
          .optional(),
        writingSession: vine
          .object({
            startTime: vine.string(), // ISO date string
            endTime: vine.string(), // ISO date string
            pauseCount: vine.number().min(0),
            revisionCount: vine.number().min(0)
          })
      })
      .optional()
  })
)

/**
 * Validator for updating journal entry
 */
export const updateJournalEntryValidator = vine.compile(
  vine.object({
    title: vine
      .string()
      .maxLength(500)
      .optional(),
    content: vine
      .string()
      .minLength(1)
      .maxLength(50000)
      .optional(),
    moodTagIds: vine
      .array(vine.string().uuid())
      .optional(),
    category: vine
      .string()
      .maxLength(100)
      .optional(),
    subcategory: vine
      .string()
      .maxLength(100)
      .optional(),
    privacy: vine
      .object({
        level: vine
          .enum(['private', 'shared', 'public']),
        shareWithTherapist: vine
          .boolean()
      })
      .optional()
  })
)

/**
 * Validator for entry filters
 */
export const getEntriesFiltersValidator = vine.compile(
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
    page: vine
      .number()
      .min(1)
      .optional(),
    startDate: vine
      .string()
      .optional(), // ISO date string
    endDate: vine
      .string()
      .optional(), // ISO date string
    category: vine
      .string()
      .maxLength(100)
      .optional(),
    search: vine
      .string()
      .maxLength(500)
      .optional(),
    moodTags: vine
      .string() // comma-separated UUIDs
      .optional()
  })
)

/**
 * Validator for prompt filters
 */
export const getPromptsFiltersValidator = vine.compile(
  vine.object({
    category: vine
      .string()
      .maxLength(100)
      .optional(),
    difficulty: vine
      .enum(['easy', 'medium', 'hard'])
      .optional(),
    type: vine
      .enum(['standard', 'guided', 'creative', 'therapeutic'])
      .optional(),
    language: vine
      .string()
      .maxLength(10)
      .optional(),
    excludeUsed: vine
      .boolean()
      .optional()
  })
)

/**
 * Validator for search entries
 */
export const searchEntriesValidator = vine.compile(
  vine.object({
    query: vine
      .string()
      .minLength(1)
      .maxLength(500),
    category: vine
      .string()
      .maxLength(100)
      .optional(),
    dateRange: vine
      .object({
        start: vine.string(), // ISO date
        end: vine.string() // ISO date
      })
      .optional(),
    moodTags: vine
      .array(vine.string().uuid())
      .optional(),
    limit: vine
      .number()
      .min(1)
      .max(50)
      .optional()
  })
)

/**
 * Validator for journal stats request
 */
export const journalStatsValidator = vine.compile(
  vine.object({
    period: vine
      .enum(['week', 'month', 'quarter', 'year'])
      .optional(),
    startDate: vine
      .string()
      .optional(),
    endDate: vine
      .string()
      .optional(),
    includeWordCount: vine
      .boolean()
      .optional(),
    includeMoodTrends: vine
      .boolean()
      .optional(),
    includeStreaks: vine
      .boolean()
      .optional()
  })
)

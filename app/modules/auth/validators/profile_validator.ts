import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().optional(),
    lastName: vine.string().optional(),
    displayName: vine.string().optional(),
    dateOfBirth: vine.string().optional(),
    sex: vine.enum(['MENINO', 'MENINA', 'OTHER']).optional(),
    age: vine.number().min(1).max(120).optional(),
    goals: vine.array(vine.string()).optional(),
    experienceLevel: vine.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    avatarUrl: vine.string().url().optional(),
    preferences: vine.object({}).optional()
  })
)

export const completeOnboardingValidator = vine.compile(
  vine.object({
    // Basic profile info (optional for onboarding)
    firstName: vine.string().optional(),
    lastName: vine.string().optional(),
    
    // Onboarding data from mobile app
    dateOfBirth: vine.string().optional(),
    goals: vine.array(vine.string()).optional(),
    mentalHealthConcerns: vine.array(vine.string()).optional(),
    preferredActivities: vine.array(vine.string()).optional(),
    currentStressLevel: vine.number().min(1).max(10).optional(),
    sleepHours: vine.number().min(1).max(24).optional(),
    exerciseFrequency: vine.string().optional(),
    preferredContactMethod: vine.string().optional(),
    notificationPreferences: vine.object({
      reminders: vine.boolean().optional(),
      progress: vine.boolean().optional(),
      tips: vine.boolean().optional()
    }).optional(),
    
    // Legacy fields (keep for backwards compatibility)
    sex: vine.enum(['MENINO', 'MENINA', 'OTHER']).optional(),
    age: vine.number().min(1).max(120).optional(),
    experienceLevel: vine.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    preferences: vine.object({}).optional()
  })
)

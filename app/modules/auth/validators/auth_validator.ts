import vine from '@vinejs/vine'

/**
 * Validator for user registration
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .maxLength(255),
    password: vine
      .string()
      .minLength(6)
      .maxLength(100),
    password_confirmation: vine
      .string()
      .optional(),
    firstName: vine
      .string()
      .maxLength(100)
      .optional(),
    lastName: vine
      .string()
      .maxLength(100)
      .optional(),
    name: vine
      .string()
      .maxLength(200)
      .optional()
  })
)

/**
 * Validator for user login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail(),
    password: vine
      .string()
      .minLength(1)
  })
)

/**
 * Validator for password validation
 */
export const passwordValidator = vine.compile(
  vine.object({
    password: vine
      .string()
      .minLength(8)
      .maxLength(100)
  })
)

/**
 * Validator for email verification
 */
export const emailVerificationValidator = vine.compile(
  vine.object({
    token: vine
      .string()
      .uuid()
  })
)

/**
 * Validator for password reset request
 */
export const passwordResetRequestValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
  })
)

/**
 * Validator for password reset
 */
export const passwordResetValidator = vine.compile(
  vine.object({
    token: vine
      .string()
      .uuid(),
    password: vine
      .string()
      .minLength(8)
      .maxLength(100)
      .confirmed()
  })
)

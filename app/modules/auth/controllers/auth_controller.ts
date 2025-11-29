import type { HttpContext } from '@adonisjs/core/http'
import { AuthService } from '#modules/auth/services/auth_service'
import { createUserValidator, loginValidator } from '#modules/auth/validators/auth_validator'
import { updateProfileValidator, completeOnboardingValidator } from '#modules/auth/validators/profile_validator'
import User from '#models/user'
import UserProfile from '#models/user_profile'
import { DateTime } from 'luxon'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    try {
      // Validate request data
      const data = await request.validateUsing(createUserValidator)
      
      
      // Extract device info for refresh token
      const deviceInfo = {
        userAgent: request.header('user-agent'),
        ipAddress: request.ip(),
        fingerprint: request.header('x-device-fingerprint')
      }
      
      // Register user
      const result = await AuthService.register(data, deviceInfo)
      
      if (!result.success) {
        return response.status(400).json({
          success: false,
          error: result.message,
          message: result.message
        })
      }

      return response.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken
        },
        message: 'User registered successfully'
      })
    } catch (error) {
      console.error('Auth Controller Registration error:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Registration failed due to server error'
      })
    }
  }

  /**
   * Login user
   */
  async login({ request, response }: HttpContext) {
    try {
      // Validate request data
      const credentials = await request.validateUsing(loginValidator)
      
      // Extract device info for refresh token
      const deviceInfo = {
        userAgent: request.header('user-agent'),
        ipAddress: request.ip(),
        fingerprint: request.header('x-device-fingerprint')
      }
      
      // Login user
      const result = await AuthService.login(credentials, deviceInfo)
      
      if (!result.success) {
        return response.status(401).json({
          success: false,
          error: result.message,
          message: result.message // Use the specific message from AuthService
        })
      }

      return response.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken
        },
        message: 'Login successful'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Login failed due to server error'
      })
    }
  }

  /**
   * Get current user profile
   */
  async profile({ response, auth }: HttpContext) {
    try {
      console.log('Profile method called, auth:', auth)
      
      if (!auth) {
        return response.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'User not authenticated'
        })
      }

      // Fetch user with profile from database
      const user = await User.query()
        .where('id', auth.userId)
        .preload('profile')
        .first()

      if (!user) {
        return response.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        })
      }

      // Get or create profile if it doesn't exist
      const profile = await user.getOrCreateProfile()

      return response.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          profile: profile.serialize()
        },
        message: 'Profile retrieved successfully'
      })
    } catch (error) {
      console.error('Profile error:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve profile'
      })
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout({ request, response }: HttpContext) {
    try {
      const refreshToken = request.input('refreshToken')
      
      if (refreshToken) {
        await AuthService.revokeRefreshToken(refreshToken)
      }
      
      return response.json({
        success: true,
        message: 'Logout successful'
      })
    } catch (error) {
      return response.json({
        success: true,
        message: 'Logout successful' // Always return success for logout
      })
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken({ request, response }: HttpContext) {
    try {
      const { refreshToken } = request.only(['refreshToken'])
      
      if (!refreshToken) {
        return response.status(400).json({
          success: false,
          error: 'Refresh token is required',
          message: 'Token refresh failed'
        })
      }

      // Extract device info
      const deviceInfo = {
        userAgent: request.header('user-agent'),
        ipAddress: request.ip(),
        fingerprint: request.header('x-device-fingerprint')
      }

      const result = await AuthService.refreshToken(refreshToken, deviceInfo)
      
      if (!result.success) {
        return response.status(401).json({
          success: false,
          error: result.message,
          message: 'Token refresh failed'
        })
      }

      return response.json({
        success: true,
        data: {
          token: result.tokens?.accessToken,
          refreshToken: result.tokens?.refreshToken
        },
        message: 'Token refreshed successfully'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Token refresh failed due to server error'
      })
    }
  }

  /**
   * Complete user onboarding
   */
  async completeOnboarding({ auth, request, response }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }

      const userId = auth.userId
      const payload = await request.validateUsing(completeOnboardingValidator)

      // Buscar o usuário
      const user = await User.findOrFail(userId)
      
      // Usar o método getOrCreateProfile para garantir que o perfil existe
      const profile = await user.getOrCreateProfile() as UserProfile

      // Mapear os dados do mobile app para os campos da tabela
      if (payload.dateOfBirth) {
        // Parse date without timezone to avoid day shift issues
        profile.dateOfBirth = DateTime.fromISO(payload.dateOfBirth, { zone: 'utc' }).startOf('day')
      }

      // Usar preferences para armazenar dados adicionais do onboarding
      const preferences = profile.preferences || {}
      
      if (payload.mentalHealthConcerns) {
        preferences.mentalHealthConcerns = payload.mentalHealthConcerns
      }
      
      if (payload.preferredActivities) {
        preferences.preferredActivities = payload.preferredActivities
      }
      
      if (payload.currentStressLevel !== undefined) {
        preferences.currentStressLevel = payload.currentStressLevel
      }
      
      if (payload.sleepHours !== undefined) {
        preferences.sleepHours = payload.sleepHours
      }
      
      if (payload.exerciseFrequency) {
        preferences.exerciseFrequency = payload.exerciseFrequency
      }
      
      if (payload.preferredContactMethod) {
        preferences.preferredContactMethod = payload.preferredContactMethod
      }
      
      if (payload.notificationPreferences) {
        preferences.notificationPreferences = payload.notificationPreferences
      }

      profile.preferences = preferences
      profile.onboardingCompleted = true

      await profile.save()

      return response.json({
        success: true,
        data: {
          profile: profile.serialize()
        },
        message: 'Onboarding completed successfully'
      })
    } catch (error) {
      console.error('Complete onboarding error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to complete onboarding',
        error: error.message
      })
    }
  }

  /**
   * Update user profile
   */
  async updateProfile({ request, response, auth }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'User not authenticated'
        })
      }

      // Validate profile data
      const data = await request.validateUsing(updateProfileValidator)

      // Find user
      const user = await User.find(auth.userId)
      if (!user) {
        return response.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        })
      }

      // Get or create profile
      let profile = await user.getOrCreateProfile() as UserProfile

      // Update profile with provided data
      if (data.firstName !== undefined) profile.firstName = data.firstName
      if (data.lastName !== undefined) profile.lastName = data.lastName
      if (data.displayName !== undefined) profile.displayName = data.displayName
      if (data.dateOfBirth !== undefined) {
        // Parse date without timezone to avoid day shift issues
        profile.dateOfBirth = DateTime.fromISO(data.dateOfBirth, { zone: 'utc' }).startOf('day')
      }
      if (data.sex !== undefined) profile.sex = data.sex
      if (data.avatarUrl !== undefined) profile.avatarUrl = data.avatarUrl
      
      await profile.save()
      const responseData = {
        user: user.serialize(),
        profile: profile.serialize()
      }

      return response.json({
        success: true,
        data: responseData,
        message: 'Profile updated successfully'
      })
    } catch (error) {
      console.error('Update profile error:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update profile'
      })
    }
  }
  async validatePassword({ request, response }: HttpContext) {
    try {
      const { password } = request.only(['password'])
      
      if (!password) {
        return response.status(400).json({
          success: false,
          error: 'Password is required',
          message: 'Validation failed'
        })
      }

      const validation = AuthService.validatePassword(password)
      
      return response.json({
        success: true,
        data: validation,
        message: validation.valid ? 'Password is valid' : 'Password validation failed'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Password validation failed'
      })
    }
  }
}

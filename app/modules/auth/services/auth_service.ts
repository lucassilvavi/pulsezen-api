import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'
import crypto from 'crypto'
import env from '#start/env'
import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import MoodEntry from '#models/mood_entry'
import { StructuredLogger } from '#services/structured_logger'

export interface CreateUserData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  name?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: {
    id: string
    email: string
    emailVerified: boolean
    onboardingComplete?: boolean
    profile?: any
  }
  token?: string
  refreshToken?: string
  message?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResult {
  success: boolean
  tokens?: TokenPair
  message?: string
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: CreateUserData, deviceInfo?: any): Promise<AuthResult> {
    try {
      StructuredLogger.security('User registration attempt', {
        eventType: 'auth_attempt',
        email: data.email,
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
        riskLevel: 'low'
      })

      // Check if user already exists in database
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        StructuredLogger.security('User registration failed - email exists', {
          eventType: 'auth_failure',
          email: data.email,
          userAgent: deviceInfo?.userAgent,
          ipAddress: deviceInfo?.ipAddress,
          riskLevel: 'low'
        })
        return { success: false, message: 'Email já cadastrado!' }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12)
      
      // Create user ID
      const userId = uuidv4()
      
      // Save user to database
      const user = await User.create({
        id: userId,
        email: data.email,
        passwordHash,
        emailVerified: false
      })

      // Create initial profile with name data
      const profile = await user.getOrCreateProfile()
      
      // Update profile with firstName and lastName if provided
      if (data.firstName || data.lastName) {
        await profile.merge({
          firstName: data.firstName || null,
          lastName: data.lastName || null
        }).save()
      }

      // Generate token pair
      const tokens = await this.generateTokenPair(userId, data.email, deviceInfo)

      StructuredLogger.security('User registration successful', {
        eventType: 'auth_success',
        email: data.email,
        userId: user.id,
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
        riskLevel: 'low'
      })

      // Serialize the profile data
      const profileData = profile.serialize()

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          onboardingComplete: profileData.onboardingCompleted,
          profile: profileData
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    } catch (error) {
      StructuredLogger.error('Registration error', error, {
        email: data.email,
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress
      })
      return { 
        success: false, 
        message: 'Registration failed' 
      }
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials, deviceInfo?: any): Promise<AuthResult> {
    try {
      StructuredLogger.security('User login attempt', {
        eventType: 'auth_attempt',
        email: credentials.email,
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
        riskLevel: 'low'
      })

      // Find user in database with profile preloaded
      const user = await User.query()
        .where('email', credentials.email)
        .preload('profile')
        .first()
        
      if (!user) {
        StructuredLogger.security('Login failed - user not found', {
          eventType: 'auth_failure',
          email: credentials.email,
          userAgent: deviceInfo?.userAgent,
          ipAddress: deviceInfo?.ipAddress,
          riskLevel: 'medium'
        })
        return { success: false, message: 'Invalid credentials' }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
      if (!isValidPassword) {
        StructuredLogger.security('Login failed - invalid password', {
          eventType: 'auth_failure',
          email: credentials.email,
          userId: user.id,
          userAgent: deviceInfo?.userAgent,
          ipAddress: deviceInfo?.ipAddress,
          riskLevel: 'high'
        })
        return { success: false, message: 'Invalid credentials' }
      }

      // Get or create profile if it doesn't exist
      const profile = await user.getOrCreateProfile()

      // Generate token pair
      const tokens = await this.generateTokenPair(user.id, user.email, deviceInfo)

      StructuredLogger.security('User login successful', {
        eventType: 'auth_success',
        email: user.email,
        userId: user.id,
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
        riskLevel: 'low'
      })

      // Serialize the profile data
      const profileData = profile.serialize()

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          onboardingComplete: profileData.onboardingCompleted,
          profile: profileData
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    } catch (error) {
      StructuredLogger.error('Login error', error, {
        email: credentials.email,
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress
      })
      return { 
        success: false, 
        message: 'Login failed' 
      }
    }
  }

  /**
   * Generate JWT token with mood data
   */
  static async generateToken(userId: string, email: string): Promise<string> {
    // Get today's mood data for all periods
    const today = DateTime.now().startOf('day').toISO()
    const tomorrow = DateTime.now().startOf('day').plus({ days: 1 }).toISO()
    
    const moodEntries = await MoodEntry.query()
      .where('user_id', userId)
      .where('created_at', '>=', today)
      .where('created_at', '<', tomorrow)
      .select('period')
    
    // Create mood status object
    const moodStatus = {
      manha: false,
      tarde: false,
      noite: false
    }
    
    // Mark periods that have entries
    moodEntries.forEach(entry => {
      if (entry.period in moodStatus) {
        moodStatus[entry.period as keyof typeof moodStatus] = true
      }
    })

    const payload = {
      userId,
      email,
      moodStatus, // Add mood data to token
      iat: Math.floor(Date.now() / 1000)
    }

    const expiresIn = env.get('JWT_EXPIRES_IN') || '15m' // Shorter for access tokens
    const secret = env.get('JWT_SECRET')
    
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
  }

  /**
   * Generate both access and refresh tokens
   */
  static async generateTokenPair(userId: string, email: string, deviceInfo?: any): Promise<TokenPair> {
    // Generate short-lived access token
    const accessToken = await this.generateToken(userId, email)
    
    // Generate long-lived refresh token
    const refreshTokenId = uuidv4()
    const refreshTokenValue = crypto.randomBytes(64).toString('hex')
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex')
    
    // Store refresh token in database
    await RefreshToken.create({
      id: refreshTokenId,
      userId,
      tokenHash: refreshTokenHash,
      deviceFingerprint: deviceInfo?.fingerprint || null,
      userAgent: deviceInfo?.userAgent || null,
      ipAddress: deviceInfo?.ipAddress || null,
      isRevoked: false,
      expiresAt: DateTime.now().plus({ days: 30 }) // 30 days
    })

    return {
      accessToken,
      refreshToken: `${refreshTokenId}:${refreshTokenValue}`
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshTokenString: string, deviceInfo?: any): Promise<RefreshTokenResult> {
    try {
      // Parse refresh token
      const [tokenId, tokenValue] = refreshTokenString.split(':')
      if (!tokenId || !tokenValue) {
        return { success: false, message: 'Invalid refresh token format' }
      }

      // Find refresh token in database
      const refreshToken = await RefreshToken.query()
        .where('id', tokenId)
        .preload('user')
        .first()

      if (!refreshToken) {
        return { success: false, message: 'Refresh token not found' }
      }

      // Validate refresh token
      if (!refreshToken.isValid) {
        return { success: false, message: 'Refresh token expired or revoked' }
      }

      // Verify token hash
      const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex')
      if (refreshToken.tokenHash !== tokenHash) {
        return { success: false, message: 'Invalid refresh token' }
      }

      // Update last used timestamp
      refreshToken.lastUsedAt = DateTime.now()
      await refreshToken.save()

      // Generate new token pair
      const newTokens = await this.generateTokenPair(
        refreshToken.userId, 
        refreshToken.user.email, 
        deviceInfo
      )

      // Optionally revoke old refresh token (for security)
      refreshToken.isRevoked = true
      await refreshToken.save()

      return {
        success: true,
        tokens: newTokens
      }
    } catch (error) {
      console.error('Refresh token error:', error)
      return { 
        success: false, 
        message: 'Token refresh failed' 
      }
    }
  }

  /**
   * Revoke refresh token (logout)
   */
  static async revokeRefreshToken(refreshTokenString: string): Promise<boolean> {
    try {
      const [tokenId] = refreshTokenString.split(':')
      if (!tokenId) return false

      const refreshToken = await RefreshToken.find(tokenId)
      if (!refreshToken) return false

      refreshToken.isRevoked = true
      await refreshToken.save()

      return true
    } catch (error) {
      console.error('Revoke refresh token error:', error)
      return false
    }
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  static async revokeAllRefreshTokens(userId: string): Promise<boolean> {
    try {
      await RefreshToken.query()
        .where('userId', userId)
        .update({ isRevoked: true })
      
      return true
    } catch (error) {
      console.error('Revoke all refresh tokens error:', error)
      return false
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const secret = env.get('JWT_SECRET')
      const decoded = jwt.verify(token, secret) as any
      return {
        userId: decoded.userId,
        email: decoded.email
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Validate password strength (for mobile apps)
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' }
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }

    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' }
    }

    return { valid: true }
  }
}

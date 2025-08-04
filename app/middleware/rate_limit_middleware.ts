import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { StructuredLogger } from '#services/structured_logger'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

interface UserRateLimitConfig {
  windowMs: number
  maxRequests: number
  tier: 'basic' | 'premium' | 'admin'
}

export default class RateLimitMiddleware {
  private static store: RateLimitStore = {}
  private static readonly WINDOW_MS = 15 * 60 * 1000 // 15 minutes
  private static readonly DEFAULT_MAX_REQUESTS = 100 // requests per window
  private static readonly MOBILE_MAX_REQUESTS = 200 // higher limit for mobile apps
  
  // Per-user rate limits based on tier
  private static readonly USER_RATE_LIMITS: Record<string, UserRateLimitConfig> = {
    basic: { windowMs: 15 * 60 * 1000, maxRequests: 100, tier: 'basic' },
    premium: { windowMs: 15 * 60 * 1000, maxRequests: 500, tier: 'premium' },
    admin: { windowMs: 15 * 60 * 1000, maxRequests: 1000, tier: 'admin' }
  }

  // Mood-specific rate limits (more restrictive for POST operations)
  private static readonly MOOD_RATE_LIMITS: Record<string, UserRateLimitConfig> = {
    'POST:/api/v1/mood/entries': { windowMs: 60 * 60 * 1000, maxRequests: 3, tier: 'basic' }, // 3 per hour
    'GET:/api/v1/mood/stats': { windowMs: 60 * 60 * 1000, maxRequests: 60, tier: 'basic' }, // 60 per hour
    'GET:/api/v1/mood/trend': { windowMs: 60 * 60 * 1000, maxRequests: 30, tier: 'basic' }, // 30 per hour
  }

  /**
   * Handle the incoming HTTP request with rate limiting
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response, auth } = ctx
    
    try {
      // Get client identifier with priority: userId > IP + User-Agent
      const clientId = this.getClientId(request, auth?.userId)
      const now = Date.now()
      
      // Clean expired entries
      this.cleanExpiredEntries(now)
      
      // Get rate limit configuration for user
      const rateLimitConfig = this.getRateLimitConfig(auth?.userId, request)
      
      // Get or create rate limit entry
      let rateLimitEntry = RateLimitMiddleware.store[clientId]
      
      if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
        // Create new entry or reset expired one
        rateLimitEntry = {
          count: 0,
          resetTime: now + rateLimitConfig.windowMs
        }
        RateLimitMiddleware.store[clientId] = rateLimitEntry
      }
      
      // Check if limit exceeded
      if (rateLimitEntry.count >= rateLimitConfig.maxRequests) {
        const remainingTime = Math.ceil((rateLimitEntry.resetTime - now) / 1000)
        
        // Log rate limit violation
        StructuredLogger.security('Rate limit exceeded', {
          eventType: 'suspicious_activity',
          userId: auth?.userId,
          userAgent: request.header('user-agent'),
          ipAddress: request.ip(),
          riskLevel: 'medium',
          clientId,
          requestCount: rateLimitEntry.count,
          maxRequests: rateLimitConfig.maxRequests
        })
        
        response.header('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString())
        response.header('X-RateLimit-Remaining', '0')
        response.header('X-RateLimit-Reset', remainingTime.toString())
        
        return response.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${remainingTime} seconds.`,
          retryAfter: remainingTime
        })
      }
      
      // Increment counter
      rateLimitEntry.count++
      
      // Set rate limit headers
      const remaining = rateLimitConfig.maxRequests - rateLimitEntry.count
      const resetTime = Math.ceil((rateLimitEntry.resetTime - now) / 1000)
      
      response.header('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString())
      response.header('X-RateLimit-Remaining', remaining.toString())
      response.header('X-RateLimit-Reset', resetTime.toString())
      response.header('X-RateLimit-User-Tier', rateLimitConfig.tier)
      
      await next()
    } catch (error) {
      // In case of error, allow the request to proceed but log it
      StructuredLogger.error('Rate limiting middleware error', error, {
        userId: auth?.userId,
        url: request.url(),
        method: request.method()
      })
      await next()
    }
  }

  /**
   * Generate client identifier for rate limiting
   */
  private getClientId(request: any, userId?: string): string {
    if (userId) {
      // Use userId as primary identifier for authenticated users
      return `user:${userId}`
    }
    
    // Fallback to IP + User-Agent for anonymous users
    const ip = request.ip() || 'unknown'
    const userAgent = request.header('user-agent') || 'unknown'
    return `ip:${ip}:${userAgent}`
  }

  /**
   * Get rate limit configuration based on user tier and request type
   */
  private getRateLimitConfig(userId?: string, request?: any): UserRateLimitConfig {
    // Check for mood-specific rate limits first
    const method = request?.method()
    const url = request?.url()
    if (method && url) {
      const routeKey = `${method}:${url}`
      const moodLimit = RateLimitMiddleware.MOOD_RATE_LIMITS[routeKey]
      if (moodLimit) {
        StructuredLogger.info('Using mood-specific rate limit', {
          routeKey,
          maxRequests: moodLimit.maxRequests,
          windowMs: moodLimit.windowMs,
          userId,
          action: 'mood_rate_limit_applied'
        })
        return moodLimit
      }
    }

    // For authenticated users, we could check their tier from database
    // For now, we'll use basic logic
    if (userId) {
      // TODO: Query user tier from database
      // const user = await User.find(userId)
      // return RateLimitMiddleware.USER_RATE_LIMITS[user.tier] || RateLimitMiddleware.USER_RATE_LIMITS.basic
      return RateLimitMiddleware.USER_RATE_LIMITS.basic
    }

    // For anonymous users, check if mobile app
    const isMobileApp = this.isMobileApp(request)
    return {
      windowMs: RateLimitMiddleware.WINDOW_MS,
      maxRequests: isMobileApp ? RateLimitMiddleware.MOBILE_MAX_REQUESTS : RateLimitMiddleware.DEFAULT_MAX_REQUESTS,
      tier: 'basic'
    }
  }

  /**
   * Check if request is from mobile app
   */
  private isMobileApp(request: any): boolean {
    const userAgent = request.header('user-agent')?.toLowerCase() || ''
    return userAgent.includes('pulsezen') || 
           userAgent.includes('mobile') || 
           userAgent.includes('android') || 
           userAgent.includes('iphone')
  }

  /**
   * Clean expired entries from store
   */
  private cleanExpiredEntries(now: number): void {
    for (const [key, entry] of Object.entries(RateLimitMiddleware.store)) {
      if (now > entry.resetTime) {
        delete RateLimitMiddleware.store[key]
      }
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

type RateLimitRule = {
  maxRequests: number
  windowMs: number
  message: string
}

type RateLimitRules = {
  [key: string]: RateLimitRule
}

/**
 * Middleware para rate limiting específico dos endpoints de mood
 * Diferentes limites por endpoint baseado na natureza das operações
 */
@inject()
export default class MoodRateLimiterMiddleware {
  private static readonly rateLimits: RateLimitRules = {
    // POST entries: Mais restritivo - evitar spam de entradas
    'POST:/mood/entries': {
      maxRequests: 1000, // Aumentado para desenvolvimento
      windowMs: 5 * 60 * 1000, // 5 minutos (reduzido para desenvolvimento)
      message: 'Limite de entradas de humor excedido. Máximo 10 por 5 minutos.',
    },
    // GET stats: Moderado - permite consultas frequentes mas com limite
    'GET:/mood/stats': {
      maxRequests: 60,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Limite de consultas de estatísticas excedido. Máximo 60 por hora.',
    },
    // GET trend: Menos restritivo - dados menos dinâmicos
    'GET:/mood/trend': {
      maxRequests: 30,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Limite de consultas de tendência excedido. Máximo 30 por hora.',
    },
    // GET entries: Lista - permite consultas frequentes
    'GET:/mood/entries': {
      maxRequests: 120,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Limite de consultas de entradas excedido. Máximo 120 por hora.',
    },
    // PUT/DELETE: Modificações - moderadamente restritivo
    'PUT:/mood/entries': {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Limite de atualizações excedido. Máximo 10 por hora.',
    },
    'DELETE:/mood/entries': {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Limite de exclusões excedido. Máximo 5 por hora.',
    },
  }

  private static readonly requestCounts = new Map<string, Map<string, number>>()
  private static readonly windowTimers = new Map<string, NodeJS.Timeout>()

  /**
   * Handle the HTTP request with mood-specific rate limiting
   */
  async handle({ request, response, auth }: HttpContext, next: NextFn) {
    if (!auth?.userId) {
      logger.warn('MoodRateLimiter: Unauthenticated request', {
        ip: request.ip(),
        url: request.url(),
        method: request.method(),
      })
      return next()
    }

    const method = request.method()
    const url = request.url()
    const routeKey = this.buildRouteKey(method, url)
    const userKey = auth.userId
    const requestKey = `${userKey}:${routeKey}`

    // Se não há limite configurado para esta rota, prosseguir
    const limit = MoodRateLimiterMiddleware.rateLimits[routeKey]
    if (!limit) {
      logger.debug('MoodRateLimiter: No limit configured', { routeKey })
      return next()
    }

    // Burst allowance para stats - permite rajadas curtas
    const isBurstAllowed = this.checkBurstAllowance(routeKey, userKey)

    const currentCount = this.getCurrentRequestCount(requestKey)
    const isWithinLimit = currentCount < limit.maxRequests || isBurstAllowed

    logger.debug('MoodRateLimiter: Checking limits', {
      userId: userKey,
      routeKey,
      currentCount,
      limit: limit.maxRequests,
      isWithinLimit,
      isBurstAllowed,
    })

    if (!isWithinLimit) {
      logger.warn('MoodRateLimiter: Rate limit exceeded', {
        userId: userKey,
        routeKey,
        currentCount,
        limit: limit.maxRequests,
        windowMs: limit.windowMs,
      })

      return response.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: limit.message,
        retryAfter: Math.ceil(limit.windowMs / 1000),
        details: {
          current: currentCount,
          limit: limit.maxRequests,
          windowMs: limit.windowMs,
        },
      })
    }

    // Incrementar contador
    this.incrementRequestCount(requestKey, limit.windowMs)

    // Adicionar headers informativos
    response.header('X-RateLimit-Limit', limit.maxRequests.toString())
    response.header('X-RateLimit-Remaining', (limit.maxRequests - currentCount - 1).toString())
    response.header('X-RateLimit-Reset', (Date.now() + limit.windowMs).toString())

    logger.info('MoodRateLimiter: Request allowed', {
      userId: userKey,
      routeKey,
      remaining: limit.maxRequests - currentCount - 1,
    })

    return next()
  }

  /**
   * Build a normalized route key for rate limiting
   */
  private buildRouteKey(method: string, url: string): string {
    // Normalize URL to remove dynamic parts
    const normalizedUrl = url
      .replace(/\/api\/v1/, '') // Remove API prefix
      .replace(/\/[0-9a-f-]{36}$/i, '') // Remove UUID at end
      .replace(/\/\d+$/, '') // Remove numeric ID at end

    return `${method}:${normalizedUrl}`
  }

  /**
   * Get current request count for a user/route combination
   */
  private getCurrentRequestCount(requestKey: string): number {
    const routeKey = requestKey.split(':').slice(1).join(':')
    const routeMap = MoodRateLimiterMiddleware.requestCounts.get(routeKey)
    
    if (!routeMap) {
      return 0
    }

    return routeMap.get(requestKey) || 0
  }

  /**
   * Increment request count and set cleanup timer
   */
  private incrementRequestCount(requestKey: string, windowMs: number): void {
    const routeKey = requestKey.split(':').slice(1).join(':')
    
    // Initialize route map if not exists
    if (!MoodRateLimiterMiddleware.requestCounts.has(routeKey)) {
      MoodRateLimiterMiddleware.requestCounts.set(routeKey, new Map())
    }

    const routeMap = MoodRateLimiterMiddleware.requestCounts.get(routeKey)!
    const currentCount = routeMap.get(requestKey) || 0
    routeMap.set(requestKey, currentCount + 1)

    // Set cleanup timer (only if not already set)
    const timerKey = `${requestKey}:timer`
    if (!MoodRateLimiterMiddleware.windowTimers.has(timerKey)) {
      const timer = setTimeout(() => {
        routeMap.delete(requestKey)
        MoodRateLimiterMiddleware.windowTimers.delete(timerKey)
        
        logger.debug('MoodRateLimiter: Request count reset', {
          requestKey,
          windowMs,
        })
      }, windowMs)

      MoodRateLimiterMiddleware.windowTimers.set(timerKey, timer)
    }
  }

  /**
   * Check if burst allowance applies for stats endpoints
   * Allows short bursts of requests for better UX
   */
  private checkBurstAllowance(routeKey: string, userKey: string): boolean {
    // Burst allowance apenas para GET /mood/stats
    if (routeKey !== 'GET:/mood/stats') {
      return false
    }

    const burstKey = `${userKey}:burst:${routeKey}`
    const burstMap = MoodRateLimiterMiddleware.requestCounts.get('burst') || new Map()
    const burstCount = burstMap.get(burstKey) || 0

    // Permite até 10 requests em burst a cada 5 minutos
    const maxBurst = 10
    const burstWindowMs = 5 * 60 * 1000 // 5 minutos

    if (burstCount >= maxBurst) {
      return false
    }

    // Initialize burst map
    if (!MoodRateLimiterMiddleware.requestCounts.has('burst')) {
      MoodRateLimiterMiddleware.requestCounts.set('burst', new Map())
    }

    // Increment burst count
    const updatedBurstMap = MoodRateLimiterMiddleware.requestCounts.get('burst')!
    updatedBurstMap.set(burstKey, burstCount + 1)

    // Set burst cleanup timer
    const burstTimerKey = `${burstKey}:timer`
    if (!MoodRateLimiterMiddleware.windowTimers.has(burstTimerKey)) {
      const timer = setTimeout(() => {
        updatedBurstMap.delete(burstKey)
        MoodRateLimiterMiddleware.windowTimers.delete(burstTimerKey)
      }, burstWindowMs)

      MoodRateLimiterMiddleware.windowTimers.set(burstTimerKey, timer)
    }

    logger.debug('MoodRateLimiter: Burst allowance granted', {
      userKey,
      routeKey,
      burstCount: burstCount + 1,
      maxBurst,
    })

    return true
  }
}

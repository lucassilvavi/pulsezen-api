import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { v4 as uuidv4 } from 'uuid'
import { StructuredLogger } from '#services/structured_logger'

export default class RequestLoggingMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response, auth } = ctx
    const startTime = Date.now()
    
    // Generate unique request ID
    const requestId = uuidv4()
    ctx.requestId = requestId

    // Extract request context
    const baseContext = {
      requestId,
      method: request.method(),
      url: request.url(),
      userAgent: request.header('user-agent'),
      ipAddress: request.ip(),
      userId: auth?.userId
    }

    // Log incoming request
    StructuredLogger.http('Incoming request', {
      ...baseContext,
      statusCode: 0,
      responseTime: 0,
      headers: this.sanitizeHeaders(request.headers())
    })

    try {
      await next()
    } catch (error) {
      // Log error
      StructuredLogger.error('Request failed', error, {
        ...baseContext,
        statusCode: response.getStatus(),
        responseTime: Date.now() - startTime
      })
      throw error
    }

    // Log completed request
    const responseTime = Date.now() - startTime
    const statusCode = response.getStatus()

    StructuredLogger.http('Request completed', {
      ...baseContext,
      statusCode,
      responseTime
    })

    // Log slow requests as performance warnings
    if (responseTime > 1000) {
      StructuredLogger.performance('Slow request detected', {
        operation: `${request.method()} ${request.url()}`,
        duration: responseTime,
        ...baseContext
      })
    }
  }

  /**
   * Remove sensitive headers from logs
   */
  private sanitizeHeaders(headers: any) {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
    const sanitized = { ...headers }

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]'
      }
    }

    return sanitized
  }
}

// Extend HttpContext to include requestId
declare module '@adonisjs/core/http' {
  interface HttpContext {
    requestId?: string
  }
}

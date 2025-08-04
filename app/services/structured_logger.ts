import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'

export interface LogContext {
  userId?: string
  requestId?: string
  method?: string
  url?: string
  statusCode?: number
  responseTime?: number
  userAgent?: string
  ipAddress?: string
  error?: any
  [key: string]: any
}

export interface SecurityLogContext extends LogContext {
  eventType: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'token_refresh' | 'logout' | 'suspicious_activity'
  email?: string
  deviceFingerprint?: string
  riskLevel?: 'low' | 'medium' | 'high'
}

export interface PerformanceLogContext extends LogContext {
  operation: string
  duration: number
  queryCount?: number
  cacheHit?: boolean
}

export class StructuredLogger {
  /**
   * Log general application events
   */
  static info(message: string, context?: LogContext) {
    logger.info({
      message,
      timestamp: new Date().toISOString(),
      level: 'info',
      environment: app.nodeEnvironment,
      ...context
    })
  }

  /**
   * Log warning events
   */
  static warn(message: string, context?: LogContext) {
    logger.warn({
      message,
      timestamp: new Date().toISOString(),
      level: 'warn',
      environment: app.nodeEnvironment,
      ...context
    })
  }

  /**
   * Log error events
   */
  static error(message: string, error?: any, context?: LogContext) {
    logger.error({
      message,
      timestamp: new Date().toISOString(),
      level: 'error',
      environment: app.nodeEnvironment,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      } : undefined,
      ...context
    })
  }

  /**
   * Log security-related events
   */
  static security(message: string, context: SecurityLogContext) {
    logger.info({
      message,
      timestamp: new Date().toISOString(),
      level: 'security',
      category: 'security',
      environment: app.nodeEnvironment,
      ...context
    })
  }

  /**
   * Log performance-related events
   */
  static performance(message: string, context: PerformanceLogContext) {
    logger.info({
      message,
      timestamp: new Date().toISOString(),
      level: 'performance',
      category: 'performance',
      environment: app.nodeEnvironment,
      ...context
    })
  }

  /**
   * Log API request/response
   */
  static http(message: string, context: LogContext & {
    method: string
    url: string
    statusCode: number
    responseTime: number
  }) {
    const level = context.statusCode >= 500 ? 'error' : 
                 context.statusCode >= 400 ? 'warn' : 'info'
    
    logger[level]({
      message,
      timestamp: new Date().toISOString(),
      level: 'http',
      category: 'http',
      environment: app.nodeEnvironment,
      ...context
    })
  }

  /**
   * Log database operations
   */
  static database(message: string, context: LogContext & {
    query?: string
    duration?: number
    table?: string
    operation?: 'select' | 'insert' | 'update' | 'delete'
  }) {
    logger.info({
      message,
      timestamp: new Date().toISOString(),
      level: 'database',
      category: 'database',
      environment: app.nodeEnvironment,
      ...context
    })
  }

  /**
   * Log business logic events
   */
  static business(message: string, context: LogContext & {
    action: string
    entityType?: string
    entityId?: string
  }) {
    logger.info({
      message,
      timestamp: new Date().toISOString(),
      level: 'business',
      category: 'business',
      environment: app.nodeEnvironment,
      ...context
    })
  }
}

/**
 * Global types for PulseZen API
 */

// Base response structure for all API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

// Pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// User context for authenticated requests
export interface UserContext {
  id: string
  email: string
  emailVerified: boolean
}

// JWT Payload structure
export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Mobile app specific types
export interface MobileDeviceInfo {
  deviceType: 'phone' | 'tablet'
  os: 'ios' | 'android'
  appVersion: string
  deviceId?: string
}

// Location data for mobile context
export interface LocationData {
  latitude?: number
  longitude?: number
  city?: string
  country?: string
  timezone?: string
}

// Analytics and usage tracking
export interface UsageMetrics {
  sessionDuration?: number
  featureUsed: string
  timestamp: Date
  deviceInfo?: MobileDeviceInfo
  location?: LocationData
}

// Error types
export type ApiErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'NETWORK_ERROR'

export interface ApiError {
  type: ApiErrorType
  message: string
  details?: any
  statusCode: number
}

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'

interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Extend HttpContext to include auth property
declare module '@adonisjs/core/http' {
  interface HttpContext {
    auth?: {
      userId: string
      email: string
    }
  }
}

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx
    
    console.log('AUTH MIDDLEWARE EXECUTED!')
    
    try {
      // Get token from Authorization header
      const authHeader = request.header('authorization')
      
      console.log('Auth header:', authHeader)
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No auth header or invalid format')
        return response.status(401).json({
          success: false,
          error: 'Access denied. No valid token provided.',
          message: 'Authentication required'
        })
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      console.log('JWT_SECRET from env:', env.get('JWT_SECRET'))
      console.log('Token to verify:', token)

      // Verify and decode token
      const decoded = jwt.verify(token, env.get('JWT_SECRET')) as JwtPayload
      
      console.log('JWT decoded successfully:', decoded)
      
      // Add user info to request context for use in controllers
      // Following AdonisJS pattern - set auth directly on context
      ;(ctx as any).auth = {
        userId: decoded.userId,
        email: decoded.email
      }

      console.log('Auth context set successfully:', (ctx as any).auth)
      
      await next()
      
      console.log('Auth middleware completed successfully')
    } catch (error) {
      console.log('JWT VERIFY ERROR:', error)
      return response.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Authentication failed'
      })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default async function debugAuthMiddleware(ctx: HttpContext, next: NextFn) {
  const { response } = ctx
  
  console.log('DEBUG: Auth middleware called!')
  
  return response.status(401).json({
    success: false,
    error: 'Debug middleware - authentication required',
    message: 'This is a debug message to test middleware execution'
  })
}

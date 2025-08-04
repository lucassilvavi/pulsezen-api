import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import MoodEntry from '#models/mood_entry'

/**
 * Middleware para validar ownership de recursos de mood
 * Garante que usuários só possam acessar seus próprios dados
 */
@inject()
export default class MoodOwnershipMiddleware {
  /**
   * Handle the HTTP request to ensure mood resource ownership
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response, params } = ctx
    
    console.log('MOOD OWNERSHIP MIDDLEWARE EXECUTED!')
    console.log('ctx.auth:', ctx.auth)
    
    if (!ctx.auth?.userId) {
      console.log('MOOD OWNERSHIP: No auth context found')
      logger.warn('MoodOwnership: Unauthenticated request', {
        ip: request.ip(),
        url: request.url(),
        method: request.method(),
      })
      return response.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated',
      })
    }

    console.log('MOOD OWNERSHIP: Auth context found, proceeding...')

    const method = request.method()
    const userId = ctx.auth.userId
    
    // Para operações que requerem validação de ownership
    if (this.requiresOwnershipCheck(method, request.url())) {
      const moodEntryId = params.id
      
      if (!moodEntryId) {
        logger.warn('MoodOwnership: Missing mood entry ID', {
          userId,
          method,
          url: request.url(),
        })
        return response.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Mood entry ID is required',
        })
      }

      try {
        // Verificar se a entrada existe e pertence ao usuário
        const moodEntry = await MoodEntry.query()
          .where('id', moodEntryId)
          .where('user_id', userId)
          .first()

        if (!moodEntry) {
          logger.warn('MoodOwnership: Mood entry not found or access denied', {
            userId,
            moodEntryId,
            method,
            url: request.url(),
          })
          return response.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'Mood entry not found or you do not have permission to access it',
          })
        }

        // Validações específicas por operação
        if (method === 'PUT' || method === 'PATCH') {
          const canUpdate = this.canUpdateMoodEntry(moodEntry)
          if (!canUpdate.allowed) {
            logger.warn('MoodOwnership: Update not allowed', {
              userId,
              moodEntryId,
              reason: canUpdate.reason,
              createdAt: moodEntry.createdAt,
            })
            return response.status(403).json({
              success: false,
              error: 'Forbidden',
              message: canUpdate.reason,
            })
          }
        }

        if (method === 'DELETE') {
          const canDelete = this.canDeleteMoodEntry(moodEntry)
          if (!canDelete.allowed) {
            logger.warn('MoodOwnership: Delete not allowed', {
              userId,
              moodEntryId,
              reason: canDelete.reason,
              createdAt: moodEntry.createdAt,
            })
            return response.status(403).json({
              success: false,
              error: 'Forbidden',
              message: canDelete.reason,
            })
          }
        }

        // Anexar mood entry ao contexto para uso no controller (via custom property)
        ;(request as any).moodEntry = moodEntry

        logger.info('MoodOwnership: Access granted', {
          userId,
          moodEntryId,
          method,
          operation: this.getOperationName(method),
        })

      } catch (error) {
        logger.error('MoodOwnership: Database error during ownership check', {
          userId,
          moodEntryId,
          method,
          error: error.message,
        })
        return response.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to verify mood entry ownership',
        })
      }
    } else {
      // Para operações que não requerem ownership check específico (como GET stats, trends)
      logger.debug('MoodOwnership: No ownership check required', {
        userId,
        method,
        url: request.url(),
      })
    }

    console.log('MOOD OWNERSHIP: Calling next()')
    return next()
  }

  /**
   * Determina se a operação requer verificação de ownership
   */
  private requiresOwnershipCheck(method: string, url: string): boolean {
    // Operações que requerem ownership check são aquelas com ID específico
    const requiresCheck = [
      'GET:/api/v1/mood/entries/',    // GET specific entry
      'PUT:/api/v1/mood/entries/',    // UPDATE specific entry
      'PATCH:/api/v1/mood/entries/',  // PATCH specific entry
      'DELETE:/api/v1/mood/entries/', // DELETE specific entry
    ]

    const normalizedUrl = url.replace(/\/[0-9a-f-]{36}$/i, '/') // Remove UUID

    return requiresCheck.some(pattern => {
      const [patternMethod, patternUrl] = pattern.split(':')
      return method === patternMethod && normalizedUrl.includes(patternUrl)
    })
  }

  /**
   * Verifica se uma entrada de humor pode ser atualizada
   */
  private canUpdateMoodEntry(moodEntry: MoodEntry): { allowed: boolean; reason?: string } {
    // Regra: Só permite update em até 24 horas após criação
    const now = new Date()
    const createdAt = new Date(moodEntry.createdAt.toString())
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreation > 24) {
      return {
        allowed: false,
        reason: 'Mood entries can only be updated within 24 hours of creation',
      }
    }

    return { allowed: true }
  }

  /**
   * Verifica se uma entrada de humor pode ser deletada
   */
  private canDeleteMoodEntry(_moodEntry: MoodEntry): { allowed: boolean; reason?: string } {
    // Regra: Permite delete a qualquer momento (soft delete)
    // Pode adicionar regras específicas aqui se necessário
    return { allowed: true }
  }

  /**
   * Retorna nome da operação para logs
   */
  private getOperationName(method: string): string {
    const operations: { [key: string]: string } = {
      'GET': 'read',
      'PUT': 'update',
      'PATCH': 'partial_update',
      'DELETE': 'delete',
    }
    return operations[method] || method.toLowerCase()
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

/**
 * Middleware para sanitização de dados dos endpoints de mood
 * Previne XSS e valida estrutura de dados
 */
@inject()
export default class MoodSanitizationMiddleware {
  /**
   * Handle the HTTP request with data sanitization
   */
  async handle({ request, response }: HttpContext, next: NextFn) {
    const method = request.method()
    const url = request.url()

    console.log('MOOD SANITIZATION MIDDLEWARE EXECUTED!')
    console.log('Method:', method, 'URL:', url)

    // Aplicar sanitização apenas em endpoints que recebem dados
    if (this.requiresSanitization(method, url)) {
      try {
        const body = request.body()
        
        if (body) {
          const sanitizedBody = this.sanitizeMoodData(body)
          
          // Substituir o body com dados sanitizados
          request.updateBody(sanitizedBody)
          
          logger.debug('MoodSanitization: Data sanitized', {
            method,
            url,
            originalKeys: Object.keys(body),
            sanitizedKeys: Object.keys(sanitizedBody),
          })
        }
      } catch (error) {
        logger.error('MoodSanitization: Error sanitizing data', {
          method,
          url,
          error: error.message,
        })
        
        return response.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid data format',
        })
      }
    }

    console.log('MOOD SANITIZATION: Calling next()')
    return next()
  }

  /**
   * Determina se a operação requer sanitização
   */
  private requiresSanitization(method: string, url: string): boolean {
    const methodsWithData = ['POST', 'PUT', 'PATCH']
    const moodEndpoints = ['/api/v1/mood/', '/mood/']
    
    return methodsWithData.includes(method) && 
           moodEndpoints.some(endpoint => url.includes(endpoint))
  }

  /**
   * Sanitiza dados específicos de mood
   */
  private sanitizeMoodData(data: any): any {
    const sanitized: any = {}

    // Campos permitidos para entrada de mood
    const allowedFields = [
      'mood_level',
      'period', 
      'date',
      'notes',
      'activities',
      'emotions',
    ]

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        sanitized[field] = this.sanitizeField(field, data[field])
      }
    }

    return sanitized
  }

  /**
   * Sanitiza campo específico baseado no tipo
   */
  private sanitizeField(fieldName: string, value: any): any {
    switch (fieldName) {
      case 'mood_level':
        return this.sanitizeMoodLevel(value)
      
      case 'period':
        return this.sanitizePeriod(value)
      
      case 'date':
        return this.sanitizeDate(value)
      
      case 'notes':
        return this.sanitizeNotes(value)
      
      case 'activities':
        return this.sanitizeActivities(value)
      
      case 'emotions':
        return this.sanitizeEmotions(value)
      
      default:
        return this.sanitizeString(value)
    }
  }

  /**
   * Sanitiza nível de humor
   */
  private sanitizeMoodLevel(value: any): string | null {
    if (typeof value !== 'string') {
      return null
    }

    const validLevels = ['excelente', 'bem', 'neutro', 'mal', 'pessimo']
    const sanitized = value.trim().toLowerCase()
    
    return validLevels.includes(sanitized) ? sanitized : null
  }

  /**
   * Sanitiza período
   */
  private sanitizePeriod(value: any): string | null {
    if (typeof value !== 'string') {
      return null
    }

    const validPeriods = ['manha', 'tarde', 'noite']
    const sanitized = value.trim().toLowerCase()
    
    return validPeriods.includes(sanitized) ? sanitized : null
  }

  /**
   * Sanitiza data
   */
  private sanitizeDate(value: any): string | null {
    if (typeof value !== 'string') {
      return null
    }

    // Validar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const sanitized = value.trim()
    
    if (!dateRegex.test(sanitized)) {
      return null
    }

    // Verificar se é uma data válida
    const date = new Date(sanitized)
    if (isNaN(date.getTime())) {
      return null
    }

    return sanitized
  }

  /**
   * Sanitiza notas - previne XSS
   */
  private sanitizeNotes(value: any): string | null {
    if (typeof value !== 'string') {
      return null
    }

    let sanitized = value.trim()

    // Limite de caracteres
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500)
    }

    // Escape HTML para prevenir XSS
    sanitized = this.escapeHtml(sanitized)

    // Remover caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

    return sanitized || null
  }

  /**
   * Sanitiza array de atividades
   */
  private sanitizeActivities(value: any): string[] | null {
    if (!Array.isArray(value)) {
      return null
    }

    const sanitized = value
      .filter((item: any) => typeof item === 'string')
      .map((item: string) => this.sanitizeString(item))
      .filter((item: string) => item.length > 0)
      .slice(0, 10) // Máximo 10 atividades

    return sanitized.length > 0 ? sanitized : null
  }

  /**
   * Sanitiza array de emoções
   */
  private sanitizeEmotions(value: any): string[] | null {
    if (!Array.isArray(value)) {
      return null
    }

    const validEmotions = [
      'feliz', 'triste', 'ansioso', 'calmo', 'irritado',
      'motivado', 'cansado', 'estressado', 'relaxado',
      'confiante', 'nervoso', 'entusiasmado'
    ]

    const sanitized = value
      .filter((item: any) => typeof item === 'string')
      .map((item: string) => item.trim().toLowerCase())
      .filter((item: string) => validEmotions.includes(item))
      .slice(0, 5) // Máximo 5 emoções

    return sanitized.length > 0 ? sanitized : null
  }

  /**
   * Sanitiza string genérica
   */
  private sanitizeString(value: any): string {
    if (typeof value !== 'string') {
      return ''
    }

    let sanitized = value.trim()

    // Escape HTML
    sanitized = this.escapeHtml(sanitized)

    // Remover caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

    // Limite de caracteres
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100)
    }

    return sanitized
  }

  /**
   * Escape HTML para prevenir XSS
   */
  private escapeHtml(text: string): string {
    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    }

    return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match])
  }
}

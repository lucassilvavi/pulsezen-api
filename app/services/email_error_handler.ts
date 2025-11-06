import { StructuredLogger } from '#services/structured_logger'

export interface EmailErrorDetails {
  type: 'authentication' | 'connection' | 'timeout' | 'validation' | 'unknown'
  message: string
  originalError: any
  suggestions: string[]
}

export class EmailErrorHandler {
  static analyzeError(error: any): EmailErrorDetails {
    const errorMessage = error.message?.toLowerCase() || ''
    const errorCode = error.code || ''

    // Authentication errors
    if (errorMessage.includes('authentication') || 
        errorMessage.includes('invalid credentials') ||
        errorMessage.includes('username and password not accepted') ||
        errorCode === 'EAUTH') {
      return {
        type: 'authentication',
        message: 'Falha na autenticação SMTP',
        originalError: error,
        suggestions: [
          'Verifique se SMTP_USERNAME está correto',
          'Verifique se SMTP_PASSWORD está correto e sem espaços extras',
          'Para Gmail, certifique-se de usar App Password, não a senha normal',
          'Verifique se 2FA está habilitado e App Password foi gerado'
        ]
      }
    }

    // Connection errors
    if (errorMessage.includes('connection') ||
        errorMessage.includes('connect') ||
        errorMessage.includes('enotfound') ||
        errorMessage.includes('econnrefused') ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'ENOTFOUND') {
      return {
        type: 'connection',
        message: 'Falha na conexão SMTP',
        originalError: error,
        suggestions: [
          'Verifique se SMTP_HOST está correto (ex: smtp.gmail.com)',
          'Verifique se SMTP_PORT está correto (465 para SSL)',
          'Verifique a conectividade de rede',
          'Verifique se não há firewall bloqueando a porta'
        ]
      }
    }

    // Timeout errors
    if (errorMessage.includes('timeout') ||
        errorCode === 'ETIMEDOUT') {
      return {
        type: 'timeout',
        message: 'Timeout na conexão SMTP',
        originalError: error,
        suggestions: [
          'Verifique a conectividade de rede',
          'Tente aumentar o timeout',
          'Verifique se o servidor SMTP está respondendo'
        ]
      }
    }

    // Validation errors
    if (errorMessage.includes('invalid') ||
        errorMessage.includes('malformed') ||
        errorMessage.includes('syntax')) {
      return {
        type: 'validation',
        message: 'Erro de validação de email',
        originalError: error,
        suggestions: [
          'Verifique se o email de destino é válido',
          'Verifique se o email de origem é válido',
          'Verifique a sintaxe do template de email'
        ]
      }
    }

    // Unknown error
    return {
      type: 'unknown',
      message: 'Erro desconhecido no envio de email',
      originalError: error,
      suggestions: [
        'Verifique os logs para mais detalhes',
        'Verifique todas as configurações SMTP',
        'Teste a configuração com o comando: node ace validate:smtp'
      ]
    }
  }

  static logError(error: EmailErrorDetails, context: any = {}) {
    StructuredLogger.error('Email error analyzed', {
      errorType: error.type,
      message: error.message,
      suggestions: error.suggestions,
      context,
      originalError: {
        message: error.originalError.message,
        code: error.originalError.code,
        stack: error.originalError.stack
      }
    })
  }

  static getPublicMessage(error: EmailErrorDetails): string {
    switch (error.type) {
      case 'authentication':
        return 'Erro de configuração de email. Entre em contato com o suporte.'
      case 'connection':
        return 'Servidor de email temporariamente indisponível. Tente novamente mais tarde.'
      case 'timeout':
        return 'Timeout no envio de email. Tente novamente mais tarde.'
      case 'validation':
        return 'Email inválido. Verifique o endereço de email.'
      default:
        return 'Erro no envio de email. Tente novamente mais tarde.'
    }
  }
}
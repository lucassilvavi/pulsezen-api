import { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class DirectMailTestController {
  /**
   * Test direct email sending to verify SMTP configuration
   */
  async testDirectEmail({ response }: HttpContext) {
    try {
      console.log('🔄 Starting direct email test...')
      
      // Test direct mail sending
      const result = await mail.send((message) => {
        message
          .to('lucas.vieira789lv@gmail.com')
          .from('acalmarapp@gmail.com', 'PulseZen')
          .subject('🧪 Direct SMTP Test')
          .html(`
            <h2>🧪 Direct SMTP Test</h2>
            <p>Este é um teste direto do SMTP em produção.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          `)
      })

      console.log('✅ Direct email sent successfully:', result)

      return response.json({
        success: true,
        message: 'Direct email test completed successfully',
        result: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Direct email test failed:', error)
      
      return response.status(500).json({
        success: false,
        message: 'Direct email test failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code || 'UNKNOWN',
          stack: error.stack?.split('\n').slice(0, 5) // First 5 lines only
        },
        timestamp: new Date().toISOString()
      })
    }
  }
}
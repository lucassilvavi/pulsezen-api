import env from '#start/env'

/**
 * Validation script to check environment variables
 * Run with: node ace validate:env
 */

export default class ValidateEnv {
  static async validate() {
    console.log('🔍 Validating Environment Variables...\n')

    const checks = [
      {
        name: 'NODE_ENV',
        value: env.get('NODE_ENV'),
        required: true
      },
      {
        name: 'DATABASE_URL',
        value: env.get('DATABASE_URL'),
        required: true,
        mask: true
      },
      {
        name: 'APP_KEY',
        value: env.get('APP_KEY'),
        required: true,
        mask: true
      },
      {
        name: 'JWT_SECRET',
        value: env.get('JWT_SECRET'),
        required: true,
        mask: true
      },
      {
        name: 'SMTP_HOST',
        value: env.get('SMTP_HOST'),
        required: true
      },
      {
        name: 'SMTP_PORT',
        value: env.get('SMTP_PORT'),
        required: true
      },
      {
        name: 'SMTP_USERNAME',
        value: env.get('SMTP_USERNAME'),
        required: true
      },
      {
        name: 'SMTP_PASSWORD',
        value: env.get('SMTP_PASSWORD'),
        required: true,
        mask: true
      }
    ]

    let hasErrors = false

    for (const check of checks) {
      const status = check.value ? '✅' : '❌'
      const displayValue = check.mask && check.value 
        ? `${'*'.repeat(Math.min(check.value.length, 8))} (${check.value.length} chars)`
        : check.value || 'NOT SET'

      console.log(`${status} ${check.name}: ${displayValue}`)

      if (check.required && !check.value) {
        hasErrors = true
      }
    }

    console.log('\n📧 SMTP Configuration Details:')
    console.log(`Host: ${env.get('SMTP_HOST')}`)
    console.log(`Port: ${env.get('SMTP_PORT')}`)
    console.log(`Username: ${env.get('SMTP_USERNAME')}`)
    console.log(`Password Length: ${env.get('SMTP_PASSWORD')?.length || 0} characters`)
    console.log(`Password has spaces: ${env.get('SMTP_PASSWORD')?.includes(' ') ? 'YES' : 'NO'}`)

    if (hasErrors) {
      console.log('\n❌ Environment validation failed!')
      console.log('Please check the missing required variables.')
      process.exit(1)
    } else {
      console.log('\n✅ All required environment variables are set!')
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ValidateEnv.validate().catch(console.error)
}
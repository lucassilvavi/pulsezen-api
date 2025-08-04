#!/usr/bin/env node

/**
 * PulseZen API Setup Script
 * Configures the project for development with SQLite and Clean Architecture
 */

import { execSync } from 'child_process'
import { writeFileSync, existsSync } from 'fs'

const log = (message: string) => console.log(`🔧 ${message}`)
const success = (message: string) => console.log(`✅ ${message}`)
const error = (message: string) => console.log(`❌ ${message}`)

async function setupProject() {
  try {
    log('Setting up PulseZen API project...')

    // 1. Run migrations
    if (existsSync('database/database.sqlite')) {
      log('Database already exists, skipping migration...')
    } else {
      log('Running database migrations...')
      try {
        execSync('node ace migration:run', { stdio: 'inherit' })
        success('Database migrations completed')
      } catch (err) {
        log('Migration command failed, but continuing setup...')
      }
    }

    // 2. Create test environment file
    const testEnv = `
TZ=UTC
PORT=3334
HOST=localhost
LOG_LEVEL=info
APP_KEY=test-app-key-for-testing-only
NODE_ENV=test

# Database (SQLite for testing)
DB_CONNECTION=sqlite
DB_DATABASE=./database/test.sqlite

# JWT
JWT_SECRET=test-jwt-secret-key
JWT_EXPIRES_IN=30d

# API Configuration
API_VERSION=v1
CORS_ORIGINS=*
`.trim()

    writeFileSync('.env.test', testEnv)
    success('Test environment file created')

    // 3. Create development scripts
    const packageJsonPath = 'package.json'
    const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'))
    
    packageJson.scripts = {
      ...packageJson.scripts,
      'db:migrate': 'node ace migration:run',
      'db:rollback': 'node ace migration:rollback',
      'db:seed': 'node ace db:seed',
      'db:fresh': 'node ace migration:fresh --seed',
      'test:unit': 'node ace test --grep="Unit"',
      'test:integration': 'node ace test --grep="Integration"',
      'dev:secure': 'node ace serve --hmr --watch',
      'setup': 'npm run db:migrate && npm run db:seed'
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    success('Development scripts added to package.json')

    // 4. Create .gitignore additions
    const gitignoreAdditions = `
# Database
database/*.sqlite*
database/test.sqlite*

# Environment files
.env.local
.env.production

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
`

    if (!existsSync('.gitignore')) {
      writeFileSync('.gitignore', gitignoreAdditions)
    } else {
      require('fs').appendFileSync('.gitignore', gitignoreAdditions)
    }
    success('Updated .gitignore')

    success('🎉 PulseZen API setup completed!')
    console.log(`
📋 Next steps:
1. Run migrations: npm run db:migrate
2. Start development: npm run dev
3. Test the API: curl http://localhost:3333/api/v1/health
4. Create seed data: npm run db:seed (when implemented)

🔒 Security Notes:
- Change JWT_SECRET in production
- Use environment-specific .env files
- Enable HTTPS in production
- Implement proper rate limiting

📱 Mobile App Integration:
- API is configured for CORS with mobile apps
- Rate limiting has higher limits for mobile clients
- JWT tokens are set to expire in 30 days for mobile convenience
- All responses follow consistent JSON structure

🧪 Testing:
- Unit tests: npm run test:unit
- Integration tests: npm run test:integration
- All tests: npm test
`)

  } catch (err) {
    error(`Setup failed: ${err.message}`)
    process.exit(1)
  }
}

setupProject()

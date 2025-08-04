#!/usr/bin/env node

import { execSync } from 'child_process'

const log = (message) => console.log(`🔧 ${message}`)
const success = (message) => console.log(`✅ ${message}`)

async function createSimpleServer() {
  try {
    log('Creating simple API server without Lucid to test basic setup...')

    // Create a simple server file
    const serverContent = `import { createServer } from 'http'

const PORT = process.env.PORT || 3333

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const url = new URL(req.url, \`http://\${req.headers.host}\`)
  const path = url.pathname

  // Simple routing
  if (path === '/health') {
    res.writeHead(200)
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'PulseZen API is running'
    }))
  } else if (path === '/api/v1' || path === '/api/v1/') {
    res.writeHead(200)
    res.end(JSON.stringify({
      name: 'PulseZen API',
      version: '1.0.0',
      status: 'running (simple mode)',
      message: 'API is ready for development',
      endpoints: {
        health: '/health',
        auth: '/api/v1/auth (not implemented yet)',
        sos: '/api/v1/sos (not implemented yet)',
        journal: '/api/v1/journal (not implemented yet)',
        breathing: '/api/v1/breathing (not implemented yet)',
        music: '/api/v1/music (not implemented yet)'
      }
    }))
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({
      success: false,
      error: 'Not Found',
      message: 'Endpoint not found'
    }))
  }
})

server.listen(PORT, () => {
  console.log(\`🚀 PulseZen API running on http://localhost:\${PORT}\`)
  console.log(\`📋 Health check: http://localhost:\${PORT}/health\`)
  console.log(\`📋 API Info: http://localhost:\${PORT}/api/v1\`)
})
`

    require('fs').writeFileSync('simple-server.js', serverContent)
    success('Simple server created')

    // Update package.json to add simple start script
    const packageJson = JSON.parse(require('fs').readFileSync('package.json', 'utf8'))
    packageJson.scripts['dev:simple'] = 'node simple-server.js'
    require('fs').writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
    success('Added dev:simple script to package.json')

    console.log(`
🎉 Simple server ready!

To test the API:
1. Run: npm run dev:simple
2. Test: curl http://localhost:3333/health
3. Test: curl http://localhost:3333/api/v1

Once this works, we can fix the AdonisJS setup.
`)

  } catch (err) {
    console.error(`❌ Setup failed: ${err.message}`)
    process.exit(1)
  }
}

createSimpleServer()

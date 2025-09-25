// Script temporário para criar usuário de teste
const { execSync } = require('child_process')

try {
  // Executar comando via ace
  const result = execSync('node ace make:user --email=test@pulsezen.com --password=test123456', {
    cwd: __dirname,
    encoding: 'utf8'
  })
  console.log(result)
} catch (error) {
  console.log('Comando não existe, vou criar de outra forma...')
  
  // Vamos usar db raw query via REPL
  console.log('\nTente este comando SQL diretamente no banco:')
  console.log(`
INSERT INTO users (id, email, username, password, created_at, updated_at) 
VALUES (
  gen_random_uuid(),
  'test@pulsezen.com',
  'testuser',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  NOW()
);`)
}
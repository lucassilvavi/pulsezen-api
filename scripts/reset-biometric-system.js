#!/usr/bin/env node

/**
 * Script para resetar completamente o sistema biométrico
 * Remove todos os dados de usuários, dispositivos e tokens biométricos
 */

import { Database } from '@adonisjs/lucid/database'
import { Application } from '@adonisjs/core/app'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const APP_ROOT = join(__dirname, '..')

async function resetBiometricSystem() {
  console.log('🔄 RESETANDO SISTEMA BIOMÉTRICO')
  console.log('===============================')

  try {
    // Initialize AdonisJS application
    const app = new Application(APP_ROOT, { environment: 'development' })
    await app.init()
    await app.boot()

    const db = await Database.connection()

    console.log('\n🗑️  Limpando dados biométricos...')

    // 1. Limpar tokens biométricos
    const deletedTokens = await db.from('biometric_tokens').delete()
    console.log(`   ✅ Removidos ${deletedTokens} tokens biométricos`)

    // 2. Limpar códigos de backup
    const deletedBackupCodes = await db.from('backup_codes').delete()
    console.log(`   ✅ Removidos ${deletedBackupCodes} códigos de backup`)

    // 3. Limpar logs de autenticação
    const deletedAuthLogs = await db.from('auth_logs').delete()
    console.log(`   ✅ Removidos ${deletedAuthLogs} logs de autenticação`)

    // 4. Limpar scores de confiança de dispositivos
    const deletedTrustScores = await db.from('device_trust_scores').delete()
    console.log(`   ✅ Removidos ${deletedTrustScores} scores de confiança`)

    // 5. Limpar dispositivos de usuários
    const deletedDevices = await db.from('user_devices').delete()
    console.log(`   ✅ Removidos ${deletedDevices} dispositivos`)

    // 6. Limpar refresh tokens
    const deletedRefreshTokens = await db.from('refresh_tokens').delete()
    console.log(`   ✅ Removidos ${deletedRefreshTokens} refresh tokens`)

    // 7. Limpar perfis de usuários (opcional - mantém dados básicos)
    const deletedProfiles = await db.from('user_profiles').delete()
    console.log(`   ✅ Removidos ${deletedProfiles} perfis de usuários`)

    // 8. Limpar usuários
    const deletedUsers = await db.from('users').delete()
    console.log(`   ✅ Removidos ${deletedUsers} usuários`)

    console.log('\n✨ Sistema biométrico resetado com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('   1. Criar novo usuário no mobile app')
    console.log('   2. Fazer login com email/senha')
    console.log('   3. Configurar biometria no onboarding')
    console.log('   4. Testar login biométrico')

    // Verificar se as tabelas estão vazias
    console.log('\n🔍 Verificando limpeza...')
    const tables = [
      'users', 'user_devices', 'biometric_tokens', 
      'backup_codes', 'auth_logs', 'device_trust_scores'
    ]

    for (const table of tables) {
      const count = await db.from(table).count('* as total')
      const total = count[0].total
      console.log(`   ${table}: ${total} registros`)
    }

    await db.destroy()
    console.log('\n🎉 Reset completo! Sistema pronto para uso.')

  } catch (error) {
    console.error('❌ Erro durante o reset:', error)
    process.exit(1)
  }
}

// Executar o reset
resetBiometricSystem().catch(console.error)

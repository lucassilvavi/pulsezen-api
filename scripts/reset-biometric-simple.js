#!/usr/bin/env node

// Script simples para limpar sistema biométrico via PostgreSQL
const { Client } = require('pg');

async function resetBiometricSystem() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'pulsezen',
    password: 'pulsezen123',
    database: 'pulsezen_dev',
  });

  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    
    console.log('🧹 Limpando sistema biométrico...');
    
    // Limpar tabelas em ordem (respeitando foreign keys)
    const cleanupQueries = [
      'DELETE FROM backup_codes;',
      'DELETE FROM auth_logs;',
      'DELETE FROM device_trust_scores;',
      'DELETE FROM biometric_tokens;',
      'DELETE FROM user_devices;',
      'DELETE FROM refresh_tokens;',
      // Descomentar se quiser limpar usuários também:
      // 'DELETE FROM user_profiles;',
      // 'DELETE FROM users;',
    ];

    for (const query of cleanupQueries) {
      const result = await client.query(query);
      console.log(`✅ ${query} - ${result.rowCount} registros removidos`);
    }

    // Verificar contagem final
    console.log('\n📊 Verificando tabelas...');
    const countQuery = `
      SELECT 'users' as tabela, COUNT(*) as registros FROM users
      UNION ALL
      SELECT 'user_devices' as tabela, COUNT(*) as registros FROM user_devices
      UNION ALL
      SELECT 'biometric_tokens' as tabela, COUNT(*) as registros FROM biometric_tokens
      UNION ALL
      SELECT 'device_trust_scores' as tabela, COUNT(*) as registros FROM device_trust_scores
      UNION ALL
      SELECT 'auth_logs' as tabela, COUNT(*) as registros FROM auth_logs
      UNION ALL
      SELECT 'backup_codes' as tabela, COUNT(*) as registros FROM backup_codes
      UNION ALL
      SELECT 'refresh_tokens' as tabela, COUNT(*) as registros FROM refresh_tokens;
    `;

    const countResult = await client.query(countQuery);
    countResult.rows.forEach(row => {
      console.log(`  ${row.tabela}: ${row.registros} registros`);
    });

    console.log('\n🎉 Sistema biométrico limpo com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar sistema:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetBiometricSystem();

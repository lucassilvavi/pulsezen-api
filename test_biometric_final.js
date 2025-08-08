#!/usr/bin/env node

import { readFileSync } from 'fs';

const API_BASE = 'http://127.0.0.1:3333/api/v1';

async function makeRequest(method, endpoint, data = null, headers = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BiometricTestScript/1.0.0',
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    return {
      status: response.status,
      data: result,
      success: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      success: false,
    };
  }
}

async function runBiometricTests() {
  console.log('🧪 TESTE FINAL DO SISTEMA BIOMÉTRICO');
  console.log('=====================================');
  
  let passedTests = 0;
  let totalTests = 0;
  let currentToken = null;
  let deviceId = null;
  let deviceFingerprint = 'test-fingerprint-' + Date.now();

  // Teste 1: Registro
  totalTests++;
  console.log('\n1️⃣ Registrando usuário...');
  const registerData = {
    email: `test-${Date.now()}@biometric-test.com`,
    password: 'TestPassword123!',
    password_confirmation: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  };

  const registerResult = await makeRequest('POST', '/auth/register', registerData);
  if (registerResult.success) {
    console.log('✅ Registro bem-sucedido');
    currentToken = registerResult.data.data.token;
    passedTests++;
  } else {
    console.log('❌ Falha no registro:', registerResult.data?.message || registerResult.error);
  }

  // Teste 2: Capabilidades do dispositivo
  totalTests++;
  console.log('\n2️⃣ Verificando capabilidades do dispositivo...');
  const capabilitiesData = {
    deviceInfo: {
      platform: 'ios',
      version: '17.0',
      model: 'iPhone 15 Pro'
    },
    capabilities: {
      hasBiometrics: true,
      hasDevicePasscode: true,
      hasScreenLock: true,
      biometricTypes: ['fingerprint', 'faceId']
    }
  };

  const capabilitiesResult = await makeRequest('POST', '/auth/device/capabilities', capabilitiesData);
  if (capabilitiesResult.success) {
    console.log('✅ Capabilidades verificadas');
    passedTests++;
  } else {
    console.log('❌ Falha nas capabilidades:', capabilitiesResult.data?.message || capabilitiesResult.error);
  }

  // Teste 3: Registro do dispositivo
  totalTests++;
  console.log('\n3️⃣ Registrando dispositivo...');
  const deviceData = {
    fingerprint: deviceFingerprint,
    deviceName: 'Test iPhone',
    deviceType: 'mobile',
    platform: 'ios',
    deviceInfo: {
      platform: 'ios',
      version: '17.0',
      model: 'iPhone 15 Pro',
      screenSize: '6.1"',
      os: 'iOS 17.0'
    },
    capabilities: {
      hasBiometrics: true,
      hasDevicePasscode: true,
      hasScreenLock: true,
      biometricTypes: ['fingerprint', 'faceId']
    },
    location: {
      country: 'BR',
      city: 'São Paulo',
      timezone: 'America/Sao_Paulo'
    }
  };

  const deviceResult = await makeRequest('POST', '/auth/device/register', deviceData, {
    'Authorization': `Bearer ${currentToken}`
  });
  
  if (deviceResult.success) {
    console.log('✅ Dispositivo registrado');
    deviceId = deviceResult.data.data.device.id;
    passedTests++;
  } else {
    console.log('❌ Falha no registro do dispositivo:', deviceResult.data?.message || deviceResult.error);
    console.log('Status:', deviceResult.status);
    console.log('Response data:', JSON.stringify(deviceResult.data, null, 2));
  }

  // Teste 4: Habilitação da biometria
  totalTests++;
  console.log('\n4️⃣ Habilitando biometria...');
  const biometricData = {
    deviceFingerprint: deviceFingerprint,
    biometricType: 'fingerprint',
    publicKey: 'sample-public-key-' + Date.now(),
    challenge: 'sample-challenge-response'
  };

  const biometricResult = await makeRequest('POST', '/auth/biometric/enable', biometricData, {
    'Authorization': `Bearer ${currentToken}`
  });
  
  if (biometricResult.success) {
    console.log('✅ Biometria habilitada');
    passedTests++;
  } else {
    console.log('❌ Falha na habilitação da biometria:', biometricResult.data?.message || biometricResult.error);
    console.log('Status:', biometricResult.status);
    console.log('Response data:', JSON.stringify(biometricResult.data, null, 2));
  }

  // Teste 5: Geração de códigos de backup
  totalTests++;
  console.log('\n5️⃣ Gerando códigos de backup...');
  const backupResult = await makeRequest('POST', '/auth/backup-codes/generate', null, {
    'Authorization': `Bearer ${currentToken}`
  });
  
  if (backupResult.success) {
    console.log('✅ Códigos de backup gerados');
    passedTests++;
  } else {
    console.log('❌ Falha na geração de códigos:', backupResult.data?.message || backupResult.error);
  }

  // Teste 6: Listagem de códigos de backup
  totalTests++;
  console.log('\n6️⃣ Listando códigos de backup...');
  const listBackupResult = await makeRequest('GET', '/auth/backup-codes', null, {
    'Authorization': `Bearer ${currentToken}`
  });
  
  if (listBackupResult.success) {
    console.log('✅ Códigos listados');
    passedTests++;
  } else {
    console.log('❌ Falha na listagem de códigos:', listBackupResult.data?.message || listBackupResult.error);
  }

  // Teste 7: Login biométrico (vai falhar propositalmente - sem biometria real)
  totalTests++;
  console.log('\n7️⃣ Testando login biométrico...');
  const loginData = {
    deviceFingerprint: deviceFingerprint,
    biometricType: 'fingerprint',
    biometricSignature: 'fake-signature-for-test',
    challenge: 'login-challenge-' + Date.now(),
    deviceInfo: {
      platform: 'ios',
      version: '17.0'
    }
  };

  const loginResult = await makeRequest('POST', '/auth/biometric/login', loginData, {
    'Authorization': `Bearer ${currentToken}`
  });
  
  if (loginResult.status === 401) {
    console.log('✅ Login biométrico funcionando (rejeitou assinatura fake)');
    passedTests++;
  } else if (loginResult.status === 0) {
    console.log('⚠️ Erro de rede no login biométrico');
  } else {
    console.log('❌ Problema no login biométrico:', loginResult.data?.message || loginResult.error);
    console.log('Status:', loginResult.status);
    console.log('Response data:', JSON.stringify(loginResult.data, null, 2));
  }

  // Teste 8: Estatísticas de autenticação
  totalTests++;
  console.log('\n8️⃣ Verificando estatísticas...');
  const statsResult = await makeRequest('GET', '/auth/stats', null, {
    'Authorization': `Bearer ${currentToken}`
  });
  
  if (statsResult.success) {
    console.log('✅ Estatísticas obtidas');
    passedTests++;
  } else {
    console.log('❌ Falha nas estatísticas:', statsResult.data?.message || statsResult.error);
  }

  // Teste 9: Remoção do dispositivo
  if (deviceId) {
    totalTests++;
    console.log('\n9️⃣ Removendo dispositivo...');
    const removeResult = await makeRequest('DELETE', `/auth/device/${deviceId}`, null, {
      'Authorization': `Bearer ${currentToken}`
    });
    
    if (removeResult.success) {
      console.log('✅ Dispositivo removido');
      passedTests++;
    } else {
      console.log('❌ Falha na remoção:', removeResult.data?.message || removeResult.error);
    }
  }

  // Resultado final
  console.log('\n📊 RESULTADO FINAL');
  console.log('==================');
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema biométrico funcional!');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('🔶 Sistema em sua maioria funcional, algumas verificações necessárias');
  } else {
    console.log('🔴 Sistema precisa de correções importantes');
  }
}

// Executar os testes
runBiometricTests().catch(console.error);

#!/usr/bin/env node

import { readFileSync } from 'fs';

const API_BASE = 'http://192.168.3.73:3333/api/v1';

async function makeRequest(method, endpoint, data = null, headers = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BiometricFixScript/1.0.0',
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

async function fixBiometricUser() {
  console.log('🔧 CONFIGURANDO BIOMETRIA PARA USUÁRIO EXISTENTE');
  console.log('================================================');
  
  // Login with existing user
  console.log('\n1️⃣ Fazendo login com usuário existente...');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'joi@ig.com', // User from logs
    password: 'password123' // Try common password
  });

  if (!loginResult.success) {
    console.log('❌ Falha no login:', loginResult.data?.message || loginResult.error);
    console.log('💡 Crie um usuário primeiro ou use credenciais corretas');
    return;
  }

  const token = loginResult.data.data.token;
  console.log('✅ Login bem-sucedido');

  // Register device
  console.log('\n2️⃣ Registrando dispositivo...');
  const deviceFingerprint = 'test-fingerprint-' + Date.now();
  const deviceData = {
    fingerprint: deviceFingerprint,
    deviceName: 'Test Smartphone',
    deviceType: 'mobile',
    platform: 'android',
    osVersion: '13',
    appVersion: '1.0.0',
    capabilities: {
      hasBiometrics: true,
      hasDevicePasscode: true,
      hasScreenLock: true,
      biometricTypes: ['fingerprint', 'faceId']
    },
    deviceInfo: {
      platform: 'android',
      version: '13',
      model: 'Test Phone'
    }
  };

  const deviceResult = await makeRequest('POST', '/auth/device/register', deviceData, {
    'Authorization': `Bearer ${token}`
  });

  if (!deviceResult.success) {
    console.log('❌ Falha no registro do dispositivo:', deviceResult.data?.message || deviceResult.error);
    return;
  }

  const deviceId = deviceResult.data.data.device.id;
  console.log('✅ Dispositivo registrado:', deviceId);

  // Enable biometric
  console.log('\n3️⃣ Habilitando biometria...');
  const biometricData = {
    deviceFingerprint: deviceFingerprint,
    biometricType: 'fingerprint',
    biometricData: {
      publicKey: 'real-mock-public-key-data', // This must match mobile
      algorithm: 'RSA-2048',
      template: 'real-mock-biometric-template'
    }
  };

  const biometricResult = await makeRequest('POST', '/auth/biometric/enable', biometricData, {
    'Authorization': `Bearer ${token}`
  });

  if (!biometricResult.success) {
    console.log('❌ Falha na habilitação da biometria:', biometricResult.data?.message || biometricResult.error);
    return;
  }

  console.log('✅ Biometria habilitada');

  // Test biometric login
  console.log('\n4️⃣ Testando login biométrico...');
  
  // Generate the correct signature using the same algorithm as mobile
  const crypto = await import('crypto');
  const signatureInput = deviceId + 'real-mock-public-key-data' + 'fingerprint';
  const expectedSignature = crypto.createHash('sha256').update(signatureInput).digest('hex');
  
  const loginData = {
    deviceFingerprint: deviceFingerprint,
    biometricType: 'fingerprint',
    biometricSignature: expectedSignature,
    challengeResponse: 'test-challenge-' + Date.now(),
    deviceInfo: {
      platform: 'android',
      version: '13'
    }
  };

  const biometricLoginResult = await makeRequest('POST', '/auth/biometric/login', loginData);

  if (biometricLoginResult.success) {
    console.log('✅ Login biométrico bem-sucedido!');
    console.log('📱 Agora você pode usar biometria no mobile');
  } else {
    console.log('❌ Login biométrico falhou:', biometricLoginResult.data?.error);
    console.log('🔍 Debug info:');
    console.log('  Device ID:', deviceId);
    console.log('  Expected signature:', expectedSignature);
    console.log('  Device fingerprint:', deviceFingerprint);
  }

  console.log('\n📋 INFORMAÇÕES IMPORTANTES:');
  console.log('  Device Fingerprint:', deviceFingerprint);
  console.log('  Device ID:', deviceId);
  console.log('  Public Key: real-mock-public-key-data');
  console.log('  Algoritmo: SHA256(deviceId + publicKey + biometricType)');
}

// Executar setup
fixBiometricUser().catch(console.error);

#!/usr/bin/env node

// Script para testar o fluxo biométrico completo
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3333/api/v1';

class BiometricFlowTester {
  constructor() {
    this.userToken = null;
    this.refreshToken = null;
    this.deviceId = null;
    this.deviceFingerprint = `test-device-${Date.now()}`;
    this.testEmail = `test-${Date.now()}@biometric.com`;
    this.testPassword = 'TestPassword123!';
  }

  async makeRequest(method, endpoint, data = null, useAuth = false) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BiometricFlowTester/1.0.0',
      },
    };

    if (useAuth && this.userToken) {
      config.headers['Authorization'] = `Bearer ${this.userToken}`;
    }

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

  async step1_registerUser() {
    console.log('\n🔹 PASSO 1: Registrando usuário...');
    
    const registerData = {
      email: this.testEmail,
      password: this.testPassword,
      password_confirmation: this.testPassword,
      firstName: 'Test',
      lastName: 'User'
    };

    const result = await this.makeRequest('POST', '/auth/register', registerData);
    
    if (result.success && result.data.success) {
      this.userToken = result.data.data.token;
      this.refreshToken = result.data.data.refreshToken;
      console.log('✅ Usuário registrado com sucesso');
      console.log(`   Email: ${this.testEmail}`);
      console.log(`   Token: ${this.userToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Falha no registro:', result.data?.message || result.error);
      return false;
    }
  }

  async step2_registerDevice() {
    console.log('\n🔹 PASSO 2: Registrando dispositivo...');
    
    const deviceData = {
      fingerprint: this.deviceFingerprint,
      deviceName: 'iPhone Test Device',
      deviceType: 'mobile',
      platform: 'ios',
      osVersion: '17.0',
      appVersion: '1.0.0',
      capabilities: {
        hasBiometrics: true,
        hasDevicePasscode: true,
        hasScreenLock: true,
        biometricTypes: ['fingerprint', 'faceId']
      },
      geolocation: null,
      deviceInfo: {
        platform: 'ios',
        version: '17.0',
        model: 'iPhone 15 Pro'
      }
    };

    const result = await this.makeRequest('POST', '/auth/device/register', deviceData, true);
    
    if (result.success && result.data.success) {
      this.deviceId = result.data.data.device.id;
      console.log('✅ Dispositivo registrado com sucesso');
      console.log(`   Device ID: ${this.deviceId}`);
      console.log(`   Security Level: ${result.data.data.securityLevel}`);
      return true;
    } else {
      console.log('❌ Falha no registro do dispositivo:', result.data?.message || result.error);
      return false;
    }
  }

  async step3_enableBiometric() {
    console.log('\n🔹 PASSO 3: Habilitando biometria...');
    
    const biometricData = {
      deviceFingerprint: this.deviceFingerprint,
      biometricType: 'fingerprint',
      biometricData: {
        publicKey: 'real-mock-public-key-data', // Deve coincidir com o mobile
        algorithm: 'RSA-2048',
        template: 'real-mock-biometric-template'
      }
    };

    const result = await this.makeRequest('POST', '/auth/biometric/enable', biometricData, true);
    
    if (result.success && result.data.success) {
      console.log('✅ Biometria habilitada com sucesso');
      console.log(`   Biometric Type: ${result.data.data.biometricType}`);
      return true;
    } else {
      console.log('❌ Falha na habilitação da biometria:', result.data?.message || result.error);
      return false;
    }
  }

  async step4_testBiometricLogin() {
    console.log('\n🔹 PASSO 4: Testando login biométrico...');
    
    // Gerar assinatura usando o mesmo algoritmo do mobile
    const crypto = require('crypto');
    const publicKey = 'real-mock-public-key-data';
    const biometricType = 'fingerprint';
    const signatureInput = this.deviceId + publicKey + biometricType;
    const biometricSignature = crypto.createHash('sha256').update(signatureInput).digest('hex');
    
    const loginData = {
      deviceFingerprint: this.deviceFingerprint,
      biometricType: 'fingerprint',
      biometricSignature,
      challengeResponse: crypto.createHash('sha256').update(Date.now().toString()).digest('hex'),
      deviceInfo: {
        platform: 'ios',
        version: '17.0',
        model: 'iPhone 15 Pro'
      }
    };

    console.log(`   🔐 Signature gerada: ${biometricSignature.substring(0, 20)}...`);

    const result = await this.makeRequest('POST', '/auth/biometric/login', loginData);
    
    if (result.success && result.data.success) {
      console.log('✅ Login biométrico bem-sucedido!');
      console.log(`   Trust Score: ${result.data.data.trustScore}`);
      console.log(`   New Token: ${result.data.data.token.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Falha no login biométrico:', result.data?.error || result.error);
      if (result.data?.fallbackMethods) {
        console.log(`   Métodos de fallback: ${result.data.fallbackMethods.join(', ')}`);
      }
      return false;
    }
  }

  async step5_generateBackupCodes() {
    console.log('\n🔹 PASSO 5: Gerando códigos de backup...');
    
    const result = await this.makeRequest('POST', '/auth/backup-codes/generate', {}, true);
    
    if (result.success && result.data.success) {
      console.log('✅ Códigos de backup gerados');
      console.log(`   Total de códigos: ${result.data.data.codes.length}`);
      console.log('   🔐 IMPORTANTE: Salve estes códigos em local seguro:');
      result.data.data.rawCodes.forEach((code, index) => {
        console.log(`      ${index + 1}: ${code}`);
      });
      return true;
    } else {
      console.log('❌ Falha na geração de códigos:', result.data?.message || result.error);
      return false;
    }
  }

  async runFullTest() {
    console.log('🚀 INICIANDO TESTE COMPLETO DO FLUXO BIOMÉTRICO');
    console.log('================================================');
    
    const steps = [
      () => this.step1_registerUser(),
      () => this.step2_registerDevice(),
      () => this.step3_enableBiometric(),
      () => this.step4_testBiometricLogin(),
      () => this.step5_generateBackupCodes(),
    ];

    let passed = 0;
    for (let i = 0; i < steps.length; i++) {
      const success = await steps[i]();
      if (success) {
        passed++;
      } else {
        console.log(`\n❌ TESTE FALHOU NO PASSO ${i + 1}`);
        break;
      }
      
      // Pequena pausa entre steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n📊 RESULTADO FINAL');
    console.log('==================');
    console.log(`✅ Passos aprovados: ${passed}/${steps.length}`);
    
    if (passed === steps.length) {
      console.log('🎉 TODOS OS TESTES PASSARAM! Sistema biométrico funcionando!');
    } else {
      console.log('🔧 Sistema precisa de ajustes');
    }

    console.log('\n📝 Dados do teste:');
    console.log(`   Email: ${this.testEmail}`);
    console.log(`   Device Fingerprint: ${this.deviceFingerprint}`);
    console.log(`   Device ID: ${this.deviceId || 'N/A'}`);
  }
}

// Executar teste
const tester = new BiometricFlowTester();
tester.runFullTest().catch(console.error);

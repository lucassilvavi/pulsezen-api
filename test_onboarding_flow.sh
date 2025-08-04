#!/bin/bash

# Teste completo do fluxo de autenticação e onboarding

# Tentar detectar a porta do servidor ou usar padrão
API_BASE="http://127.0.0.1:58907/api/v1"

echo "🧪 TESTE COMPLETO DO FLUXO DE AUTENTICAÇÃO E ONBOARDING"
echo "=================================================="
echo "🔗 API Base: $API_BASE"
echo ""

# 1. Registrar usuário
echo "1️⃣ Registrando novo usuário..."
REGISTER_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste.onboarding@pulsezen.com",
    "password": "MinhaSenh@123",
    "password_confirmation": "MinhaSenh@123",
    "firstName": "João",
    "lastName": "Silva"
  }')

echo "Response: $REGISTER_RESPONSE"

# Extrair token do response
TOKEN=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Falha no registro. Tentando login..."
  
  # 2. Login se registro falhar
  LOGIN_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "teste.onboarding@pulsezen.com",
      "password": "MinhaSenh@123"
    }')
  
  echo "Login Response: $LOGIN_RESPONSE"
  TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
fi

echo "🔑 Token: ${TOKEN:0:50}..."

# 3. Verificar profile inicial
echo -e "\n2️⃣ Verificando profile inicial..."
PROFILE_RESPONSE=$(curl -s -X GET ${API_BASE}/auth/profile \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"

# 4. Completar onboarding
echo -e "\n3️⃣ Completando onboarding..."
ONBOARDING_RESPONSE=$(curl -s -X POST ${API_BASE}/auth/complete-onboarding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",
    "sex": "MENINO",
    "age": 25,
    "goals": ["stress", "sleep", "anxiety"],
    "experienceLevel": "BEGINNER",
    "preferences": {
      "notifications": true,
      "theme": "light"
    }
  }')

echo "Onboarding Response: $ONBOARDING_RESPONSE"

# 5. Verificar profile após onboarding
echo -e "\n4️⃣ Verificando profile após onboarding..."
FINAL_PROFILE_RESPONSE=$(curl -s -X GET ${API_BASE}/auth/profile \
  -H "Authorization: Bearer $TOKEN")

echo "Final Profile Response: $FINAL_PROFILE_RESPONSE"

# 6. Atualizar profile
echo -e "\n5️⃣ Atualizando profile..."
UPDATE_RESPONSE=$(curl -s -X PUT ${API_BASE}/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "JonnyTech",
    "goals": ["stress", "sleep", "anxiety", "focus"],
    "preferences": {
      "notifications": true,
      "theme": "dark"
    }
  }')

echo "Update Response: $UPDATE_RESPONSE"

echo -e "\n✅ TESTE CONCLUÍDO!"

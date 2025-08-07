# 🔐 Configuração Automática de Token - PulseZen API

Este guia mostra como configurar automaticamente as variáveis `auth_token` e `user_id` no Postman após fazer login.

## 🚀 Opção 1: Usar Coleção com Automação

### Arquivo: `PulseZen_AutoToken.postman_collection.json`

Esta coleção já possui o script de automação configurado no endpoint de login.

**Como usar:**
1. Importe a coleção `PulseZen_AutoToken.postman_collection.json`
2. Configure o environment com sua `base_url`
3. Execute o endpoint "04 - Login (Auto Token Setup)"
4. As variáveis serão configuradas automaticamente!

## 🛠️ Opção 2: Configuração Manual

### Passo 1: Adicionar Script ao Login

1. Abra sua coleção no Postman
2. Localize o endpoint de **Login** (`POST /api/v1/auth/login`)
3. Clique na aba **"Tests"** 
4. Cole o conteúdo do arquivo `login-token-script.js`
5. Salve a requisição

### Passo 2: Fazer Login

Execute o endpoint de login com seus dados:

```json
{
  "email": "lucas@ig.com",
  "password": "password123"
}
```

### Passo 3: Verificar Variáveis

Após o login bem-sucedido, verifique no console do Postman:
- ✅ `auth_token` configurado
- ✅ `user_id` configurado  
- ✅ `refresh_token` configurado (se disponível)

## 📋 Variáveis Configuradas

O script configura automaticamente as seguintes variáveis no Environment:

| Variável | Fonte | Exemplo |
|----------|-------|---------|
| `auth_token` | `response.data.token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `user_id` | `response.data.user.id` | `141b7cd6-8fb8-4275-b40e-c3947a545aa5` |
| `refresh_token` | `response.data.refreshToken` | `cb17a835-46a2-4eb9-bd13-96784c073536:...` |

## 🔍 Como Usar as Variáveis

Depois do login, use as variáveis nos endpoints autenticados:

### Authorization Header
```
Authorization: Bearer {{auth_token}}
```

### Body com User ID
```json
{
  "userId": "{{user_id}}",
  "mood_level": 4,
  "period": "morning"
}
```

## 🎯 Endpoints Que Usam Token

Todos os endpoints que requerem autenticação já estão configurados:

- ✅ GET `/api/v1/auth/profile`
- ✅ PUT `/api/v1/auth/profile`  
- ✅ POST `/api/v1/journal/entries`
- ✅ GET `/api/v1/journal/entries`
- ✅ POST `/api/v1/mood/entries`
- ✅ GET `/api/v1/mood/stats`
- ✅ GET `/api/v1/mood/analytics/*`

## 🐛 Troubleshooting

### Problema: Token não é configurado

**Solução:**
1. Verifique se o login retornou status 200
2. Confirme que a resposta contém `success: true`
3. Verifique no console se há erros JavaScript

### Problema: Token expira rapidamente

**Solução:**
- Use o `refresh_token` para renovar o token
- Configure um script de renovação automática

### Problema: Variáveis não aparecem

**Solução:**
1. Certifique-se de ter um Environment selecionado
2. Verifique se as variáveis estão no Environment correto
3. Recarregue o Postman se necessário

## 🔄 Exemplo de Resposta do Login

```json
{
    "success": true,
    "data": {
        "user": {
            "id": "141b7cd6-8fb8-4275-b40e-c3947a545aa5",
            "email": "lucas@ig.com",
            "emailVerified": false,
            "onboardingComplete": true,
            "profile": {
                "id": "95d772b1-5a70-47a9-9271-a404b58fe498",
                "firstName": "Lucas",
                "fullName": "Lucas"
            }
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "cb17a835-46a2-4eb9-bd13-96784c073536:..."
    },
    "message": "Login successful"
}
```

## ✨ Funcionalidades Extras

O script também:

- 📊 Mostra informações do usuário no console
- 🔍 Decodifica e valida o JWT token
- ⏰ Exibe data de expiração do token
- 🎯 Confirma que as variáveis foram configuradas
- 🚀 Fornece feedback visual completo

---

**💡 Dica:** Use a coleção `PulseZen_AutoToken.postman_collection.json` para ter tudo configurado automaticamente!

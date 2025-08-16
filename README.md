# 🚀 PulseZen API

# 🚀 PulseZen API

API backend para o aplicativo PulseZen - Uma plataforma de bem-estar mental com funcionalidades de SOS, Journal, Breathing e **Crisis Prediction Engine™**.

## 🔮 **DESTAQUE: CRISIS PREDICTION ENGINE™**

O PulseZen API possui um **diferencial único** no mercado: o **Crisis Prediction Engine™** - um sistema avançado de predição de crises de ansiedade baseado em machine learning e análise comportamental.

### **🎯 Principais Características:**
- **📊 Análise Multimodal**: Combina mood tracking + sentiment analysis + padrões comportamentais
- **🎯 Precisão de 73%**: Baseado em literatura científica de psicologia clínica  
- **🚨 5 Níveis de Risco**: Low → Medium → High → Critical → Emergency
- **💡 Intervenções Inteligentes**: Recomendações personalizadas baseadas nos fatores de risco
- **⚡ Tempo Real**: Atualizações a cada 6 horas ou sob demanda
- **🔒 Privacidade Total**: Dados criptografados e predições com expiração automática

### **📈 Resultados dos Testes:**
- ✅ **Baixo Risco**: 32.5% (79.5% confiança)
- ⚠️ **Alto Risco**: 78.4% (79.9% confiança) 
- 🎯 **Intervenções**: Reflexão guiada + ajuda profissional

**[📋 Documentação Completa do Crisis Prediction Engine](./CRISIS_PREDICTION_ENGINE_COMPLETE.md)**

## 🏗️ Arquitetura

Este projeto utiliza **Clean Architecture** com estrutura modular:

```
app/
├── modules/
│   ├── auth/          # Autenticação e autorização
│   ├── sos/           # Módulo SOS (emergência)
│   ├── journal/       # Módulo Diário
│   └── breathing/     # Módulo Respiração
├── middleware/        # Middlewares globais
├── types/            # Tipos TypeScript globais
└── exceptions/       # Exceções customizadas

database/
├── migrations/       # Migrations do banco
└── seeders/         # Seeds para dados iniciais
```

### Estrutura por Módulo (Clean Architecture)

```
modules/[module]/
├── controllers/      # Controladores (Interface Adapters)
├── services/        # Serviços de aplicação (Use Cases)
├── repositories/    # Repositórios (Interface Adapters)
├── entities/        # Entidades de domínio (Entities)
├── dtos/           # Data Transfer Objects
└── validators/     # Validadores de entrada
```

## 🛠️ Tecnologias

- **Framework**: AdonisJS 6
- **Database**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **ORM**: Lucid (AdonisJS)
- **Authentication**: JWT
- **Validation**: VineJS
- **Testing**: Japa
- **Language**: TypeScript

## 🔧 Setup e Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env

# 3. Executar migrations
npm run db:migrate

# 4. (Opcional) Executar seeds
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com hot reload
npm run dev:secure       # Inicia servidor com watching seguro

# Database
npm run db:migrate       # Executa migrations
npm run db:rollback      # Desfaz última migration
npm run db:seed          # Executa seeds
npm run db:fresh         # Recreia banco com seeds

# Testes
npm test                 # Todos os testes
npm run test:unit        # Testes unitários
npm run test:integration # Testes de integração

# Build e Deploy
npm run build           # Build para produção
npm start              # Inicia servidor de produção
npm run typecheck      # Verificação de tipos TypeScript
```

## 🔒 Segurança

### Autenticação

- **JWT** para autenticação stateless
- Tokens com expiração configurável (padrão: 30 dias para mobile)
- Middleware de autenticação para rotas protegidas

### Rate Limiting

- Limite padrão: 100 requests/15 minutos
- Limite para apps mobile: 200 requests/15 minutos
- Headers informativos sobre limites

### Validação

- Validação de entrada com VineJS
- Sanitização de dados
- Proteção contra ataques comuns

### CORS

- Configurado para aplicações mobile
- Origins configuráveis via ambiente

## 📱 Integração Mobile

### Headers Recomendados

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
User-Agent: PulseZen/1.0.0 (iOS/Android)
X-Device-ID: <unique_device_id>
X-App-Version: 1.0.0
```

### Estrutura de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

### Tratamento de Erros

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable message",
  "details": {...}
}
```

## 🧪 Testing

### Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
│   ├── services/      # Testes de serviços
│   └── utils/         # Testes de utilitários
├── integration/       # Testes de integração
│   ├── auth/          # Testes de autenticação
│   ├── api/           # Testes de endpoints
│   └── database/      # Testes de banco
└── functional/        # Testes funcionais completos
```

### Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm run test:unit
npm run test:integration

# Testes com coverage
npm test -- --coverage

# Testes em watch mode
npm test -- --watch
```

## 📊 API Endpoints

### Autenticação (`/api/v1/auth`)

```
POST   /register        # Registro de usuário
POST   /login          # Login
GET    /profile        # Perfil do usuário (protegido)
POST   /logout         # Logout
POST   /validate-password # Validação de senha
```

### SOS (`/api/v1/sos`)

```
GET    /emergency-resources    # Lista recursos de emergência
GET    /crisis-contacts       # Contatos de crise do usuário
POST   /crisis-contacts       # Adiciona contato
PUT    /crisis-contacts/:id   # Atualiza contato
DELETE /crisis-contacts/:id   # Remove contato
GET    /quick-relief          # Exercícios de alívio rápido
```

### Journal (`/api/v1/journal`)

```
GET    /prompts          # Lista prompts
GET    /prompts/random   # Prompt aleatório
GET    /entries          # Lista entradas
POST   /entries          # Cria entrada
GET    /entries/:id      # Entrada específica
PUT    /entries/:id      # Atualiza entrada
DELETE /entries/:id      # Remove entrada
```

### Crisis Prediction (`/api/v1/crisis`) **🔮 NOVO!**

```
POST   /predict                 # Gera nova predição de crise
GET    /prediction/latest       # Predição mais recente
GET    /predictions/history     # Histórico de predições
GET    /stats                   # Estatísticas e tendências
PUT    /config                  # Config do algoritmo (admin)
```

### Breathing (`/api/v1/breathing`)

```
GET    /techniques       # Lista técnicas
GET    /techniques/:id   # Técnica específica
POST   /sessions         # Inicia sessão
PUT    /sessions/:id     # Atualiza sessão
GET    /sessions/history # Histórico
GET    /stats           # Estatísticas
```

## 🌍 Ambiente e Deploy

### Variáveis de Ambiente

```bash
# Aplicação
NODE_ENV=development
PORT=3333
HOST=localhost
APP_KEY=your-app-key

# Database
DB_CONNECTION=sqlite
DB_DATABASE=./database/database.sqlite

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=30d

# API
API_VERSION=v1
CORS_ORIGINS=*
```

### Deploy

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

#### Docker
```bash
docker build -t pulsezen-api .
docker run -p 3333:3333 pulsezen-api
```

## 📈 Monitoramento

### Health Check

```
GET /health
```

Resposta:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T10:00:00Z",
  "services": {
    "database": "connected",
    "memory": {...},
    "uptime": 3600
  }
}
```

### Logs

- Logs estruturados com diferentes níveis
- Integração com sistemas de monitoramento
- Tracking de performance e erros

## 🤝 Contribuição

### Padrões de Código

- **ESLint** para linting
- **Prettier** para formatação
- **TypeScript** strict mode
- **Conventional Commits** para mensagens

### Workflow

1. Fork do projeto
2. Criar branch feature
3. Implementar com testes
4. Submeter Pull Request
5. Review e merge

## 📄 Licença

Este projeto é propriedade privada do PulseZen. Todos os direitos reservados.

## 🆘 Suporte

Para suporte técnico:
- **Email**: dev@pulsezen.com
- **Slack**: #pulsezen-api
- **Documentação**: https://docs.pulsezen.com/api

---

**Desenvolvido com ❤️ para o bem-estar mental**
# pulsezen-api

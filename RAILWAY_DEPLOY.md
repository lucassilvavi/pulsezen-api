# Railway Deployment Guide

## 1. Preparação do Projeto

### Adicionar Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3333

# Start the application
CMD ["npm", "start"]
```

### Configurar Railway

1. **Criar conta no Railway**: https://railway.app
2. **Conectar GitHub repository**
3. **Configurar variáveis de ambiente**:
   ```
   NODE_ENV=production
   PORT=3333
   DB_CONNECTION=pg
   PG_HOST=${{Postgres.PGHOST}}
   PG_PORT=${{Postgres.PGPORT}}
   PG_USER=${{Postgres.PGUSER}}
   PG_PASSWORD=${{Postgres.PGPASSWORD}}
   PG_DB_NAME=${{Postgres.PGDATABASE}}
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

## 2. Configuração de Database

### PostgreSQL no Railway
- Railway oferece PostgreSQL managed
- Custo: ~$5/mês
- Configuração automática via variáveis

## 3. Deploy Commands

### package.json scripts
```json
{
  "scripts": {
    "build": "node ace build --production",
    "start": "node build/server.js",
    "migrate": "node ace migration:run",
    "seed": "node ace db:seed"
  }
}
```

## 6. Health Check

A API possui endpoints de health check para monitoramento:

- `GET /health` - Status geral do sistema
- `GET /ping` - Ping simples
- `GET /info` - Informações detalhadas do sistema (development)

O Railway irá usar automaticamente o endpoint `/health` para verificar se a aplicação está funcionando.

## Custo Total Estimado
- Web Service: $5/mês
- PostgreSQL: $5/mês
- **Total: $10/mês**
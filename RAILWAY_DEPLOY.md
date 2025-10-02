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

## 2. Configuração do Dockerfile

O projeto possui dois Dockerfiles otimizados:

### Dockerfile (Alpine - Recomendado)
- **Base**: Node.js 20 Alpine Linux  
- **Tamanho**: ~150MB (menor)
- **Performance**: Mais rápido para deploy
- **Inclui**: Dependencies básicas + browser automation + Python/build tools

### Dockerfile.ubuntu (Ubuntu - Completo)
- **Base**: Node.js 20 Bullseye (Debian)
- **Tamanho**: ~800MB (maior)
- **Compatibilidade**: Máxima compatibilidade
- **Inclui**: Todos os pacotes apt + Python/build tools para native modules

**Para usar o Dockerfile.ubuntu**, renomeie os arquivos:
```bash
mv Dockerfile Dockerfile.alpine
mv Dockerfile.ubuntu Dockerfile
```

Ou use o script auxiliar:
```bash
# Usar Alpine (padrão, recomendado)
./switch-dockerfile.sh alpine

# Usar Ubuntu (máxima compatibilidade)
./switch-dockerfile.sh ubuntu
```

## 3. Browser Automation Support

### Pacotes Incluídos
Ambos Dockerfiles incluem suporte completo para browser automation:

**Alpine**: Dependencies básicas para Chromium/Puppeteer
**Ubuntu**: Todos os pacotes apt necessários:
- ca-certificates, fonts-liberation, gconf-service
- libappindicator1, libasound2, libatk1.0-0
- libc6, libcairo2, libcups2, libdbus-1-3
- libexpat1, libfontconfig1, libgbm1, libgcc1
- libgconf-2-4, libgdk-pixbuf2.0-0, libglib2.0-0
- libgtk-3-0, libnspr4, libnss3, libpango-1.0-0
- libpangocairo-1.0-0, libstdc++6, libx11-6
- libx11-xcb1, libxcb1, libxcomposite1, libxcursor1
- libxdamage1, libxext6, libxfixes3, libxi6
- libxrandr2, libxrender1, libxss1, libxtst6
- lsb-release, wget, xdg-utils, xvfb

### Environment Variables
```env
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser (Alpine)
DISPLAY=:99
```

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
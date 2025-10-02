#!/bin/bash

# PulseZen API Setup Script
# Este script configura o ambiente de desenvolvimento da API

echo "🚀 Configurando PulseZen API..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18 ou superior é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚙️ Criando arquivo .env..."
    cp .env.example .env 2>/dev/null || cat > .env << EOF
# Environment Configuration
NODE_ENV=development
PORT=3333
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=pulsezen

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=*
EOF
    echo "📄 Arquivo .env criado. Configure as variáveis de ambiente conforme necessário."
else
    echo "✅ Arquivo .env já existe"
fi

# Verificar Docker
if command -v docker &> /dev/null; then
    echo "🐳 Docker encontrado"
    
    # Perguntar se deseja iniciar o banco de dados
    read -p "🎯 Deseja iniciar o banco de dados PostgreSQL via Docker? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Iniciando PostgreSQL..."
        docker-compose up -d postgres
        echo "⏳ Aguardando banco de dados estar pronto..."
        sleep 5
        
        # Verificar se as migrações devem ser executadas
        read -p "📊 Deseja executar as migrações do banco de dados? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔄 Executando migrações..."
            npm run migration:run
        fi
    fi
else
    echo "⚠️ Docker não encontrado. Configure o PostgreSQL manualmente."
fi

# Verificar se o build funciona
echo "🔨 Testando build..."
npm run build

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure as variáveis de ambiente no arquivo .env"
echo "   2. Inicie o banco de dados: npm run docker:up"
echo "   3. Execute as migrações: npm run migration:run"
echo "   4. Inicie a API: npm run dev"
echo ""
echo "🌐 A API estará disponível em: http://localhost:3333"
echo "🏥 Health check: http://localhost:3333/health"
echo ""
echo "📚 Documentação do deploy: RAILWAY_DEPLOY.md"
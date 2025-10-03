#!/bin/bash

# Script para executar migrações em produção no Railway
echo "🚂 Executando migrations em produção no Railway..."

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado"
    echo "📦 Instale com: npm install -g @railway/cli"
    echo "🔐 Depois faça login: railway login"
    exit 1
fi

echo "🔄 Executando migrations..."
railway run npm run db:migrate:prod

if [ $? -eq 0 ]; then
    echo "✅ Migrations executadas com sucesso!"
    
    echo "🌱 Executando seeds..."
    railway run npm run db:seed:prod
    
    if [ $? -eq 0 ]; then
        echo "✅ Seeds executados com sucesso!"
    else
        echo "⚠️ Seeds falharam, mas migrations foram executadas"
    fi
else
    echo "❌ Falha ao executar migrations"
    exit 1
fi

echo ""
echo "🌐 API disponível em: https://pulsezen-api-production.up.railway.app"
echo "🏥 Health check: https://pulsezen-api-production.up.railway.app/health"
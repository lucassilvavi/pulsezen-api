#!/bin/bash

# Script para executar migrations e seeds no Railway
echo "🚂 Executando migrations e seeds no Railway..."

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado"
    echo "📦 Instale com: npm install -g @railway/cli"
    echo "🔐 Depois faça login: railway login"
    exit 1
fi

echo "🔄 Executando migrations..."
railway run node ace migration:run

echo "🌱 Executando seeds..."
railway run node ace db:seed

echo "✅ Migrations e seeds executados com sucesso!"
echo ""
echo "🌐 API disponível em: https://pulsezen-api-production.up.railway.app"
echo "🏥 Health check: https://pulsezen-api-production.up.railway.app/health"
echo ""
echo "📋 Endpoints principais:"
echo "  • /api/v1/auth/login"
echo "  • /api/v1/mood"
echo "  • /api/v1/journal" 
echo "  • /api/v1/crisis/predict"
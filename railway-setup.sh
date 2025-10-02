#!/bin/bash

# Script para configurar variáveis de ambiente no Railway
echo "🚂 Configurando variáveis de ambiente no Railway..."

# Gerar chaves de segurança
APP_KEY=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

echo "🔐 Chaves geradas:"
echo "APP_KEY: $APP_KEY"
echo "JWT_SECRET: $JWT_SECRET"
echo ""

echo "📋 Execute estes comandos no Railway CLI:"
echo ""
echo "# Core Application"
echo "railway variables set NODE_ENV=production"
echo "railway variables set HOST=0.0.0.0"
echo "railway variables set LOG_LEVEL=info"
echo ""
echo "# Security Keys"
echo "railway variables set APP_KEY=$APP_KEY"
echo "railway variables set JWT_SECRET=$JWT_SECRET"
echo ""
echo "# Database (usando suas credenciais)"
echo "railway variables set DB_CONNECTION=postgres"
echo "railway variables set DB_HOST=interchange.proxy.rlwy.net"
echo "railway variables set DB_PORT=34438"
echo "railway variables set DB_USER=postgres"
echo "railway variables set DB_PASSWORD=cDHpPDyvqvRIgDcwrNjsOSJbnmChMWyr"
echo "railway variables set DB_DATABASE=railway"
echo ""
echo "🌐 Ou configure manualmente no Railway Dashboard → Variables"
echo ""
echo "✅ Após configurar, faça redeploy:"
echo "railway redeploy"
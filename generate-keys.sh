#!/bin/bash

# Script para gerar chaves de segurança para Railway
echo "🔐 Gerando chaves de segurança para Railway..."

# Gerar APP_KEY (32 caracteres hex)
APP_KEY=$(openssl rand -hex 16)
echo "APP_KEY: $APP_KEY"

# Gerar JWT_SECRET (64 caracteres hex) 
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET: $JWT_SECRET"

echo ""
echo "📋 Copie estes valores para o Railway:"
echo ""
echo "NODE_ENV=production"
echo "HOST=0.0.0.0"
echo "LOG_LEVEL=info"
echo "DB_CONNECTION=postgres"
echo "APP_KEY=$APP_KEY"
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo "🚂 Configure no Railway Dashboard → Variables"
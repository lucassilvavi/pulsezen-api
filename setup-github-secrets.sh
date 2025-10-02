#!/bin/bash

# Script para configurar secrets do GitHub Actions
# Uso: ./setup-github-secrets.sh

set -e

echo "🔧 Configuração de Secrets do GitHub Actions"
echo "============================================="
echo ""

# Verificar se gh CLI está instalado e autenticado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI não encontrado"
    echo "📦 Instale com: brew install gh"
    exit 1
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
    echo "🔐 Fazendo login no GitHub..."
    gh auth login
fi

echo "✅ GitHub CLI configurado"
echo ""

# Verificar se estamos no repositório correto
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ "$REPO" != "lucassilvavi/pulsezen-api" ]; then
    echo "❌ Não estamos no repositório correto"
    echo "📁 Certifique-se de estar em /Users/lucas/Documents/pulsezen/pulsezen-api"
    exit 1
fi

echo "📁 Repositório: $REPO"
echo ""

# Configurar Railway Token
echo "🚂 Configuração do Railway"
echo "---------------------------"
echo ""
echo "1. Acesse: https://railway.app/account/tokens"
echo "2. Clique em 'Create New Token'"
echo "3. Dê um nome: 'GitHub Actions - PulseZen API'"
echo "4. Copie o token gerado"
echo ""
read -p "📋 Cole o RAILWAY_TOKEN aqui: " RAILWAY_TOKEN

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Token não pode estar vazio"
    exit 1
fi

# Adicionar secret ao GitHub
echo "🔄 Adicionando secret ao GitHub..."
echo "$RAILWAY_TOKEN" | gh secret set RAILWAY_TOKEN

echo "✅ RAILWAY_TOKEN configurado"
echo ""

# Verificar secrets
echo "🔍 Verificando secrets configurados:"
gh secret list

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Configure um projeto no Railway"
echo "   2. Conecte o repositório GitHub"
echo "   3. Faça um push para testar o deploy automático"
echo ""
echo "📋 Para testar o workflow:"
echo "   git add ."
echo "   git commit -m \"Test GitHub Actions workflow\""
echo "   git push"
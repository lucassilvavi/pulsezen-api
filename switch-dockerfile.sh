#!/bin/bash

# Script para alternar entre Dockerfiles
# Uso: ./switch-dockerfile.sh [alpine|ubuntu]

set -e

DOCKERFILE_TYPE=${1:-alpine}

case $DOCKERFILE_TYPE in
  "alpine")
    echo "🐧 Configurando Dockerfile Alpine (recomendado para produção)..."
    if [ -f "Dockerfile.ubuntu" ]; then
      mv Dockerfile Dockerfile.temp 2>/dev/null || true
      mv Dockerfile.ubuntu Dockerfile.ubuntu.backup 2>/dev/null || true
      mv Dockerfile.temp Dockerfile 2>/dev/null || true
    fi
    echo "✅ Dockerfile Alpine ativo"
    echo "📏 Tamanho estimado: ~150MB"
    echo "⚡ Performance: Otimizada"
    ;;
  "ubuntu")
    echo "🐧 Configurando Dockerfile Ubuntu (máxima compatibilidade)..."
    if [ -f "Dockerfile.ubuntu" ]; then
      mv Dockerfile Dockerfile.alpine
      mv Dockerfile.ubuntu Dockerfile
    else
      echo "❌ Dockerfile.ubuntu não encontrado"
      exit 1
    fi
    echo "✅ Dockerfile Ubuntu ativo"
    echo "📏 Tamanho estimado: ~800MB"
    echo "🔧 Compatibilidade: Máxima"
    ;;
  *)
    echo "❌ Tipo inválido. Use: alpine ou ubuntu"
    echo ""
    echo "Uso:"
    echo "  ./switch-dockerfile.sh alpine  - Usar Alpine Linux (recomendado)"
    echo "  ./switch-dockerfile.sh ubuntu  - Usar Ubuntu/Debian (compatibilidade)"
    exit 1
    ;;
esac

echo ""
echo "🔍 Verificando configuração atual:"
if grep -q "alpine" Dockerfile; then
  echo "📦 Dockerfile atual: Alpine Linux"
elif grep -q "bullseye\|ubuntu\|debian" Dockerfile; then
  echo "📦 Dockerfile atual: Ubuntu/Debian"
else
  echo "📦 Dockerfile atual: Personalizado"
fi

echo ""
echo "🚀 Para deploy no Railway:"
echo "   git add Dockerfile"
echo "   git commit -m 'Update Dockerfile configuration'"
echo "   git push"
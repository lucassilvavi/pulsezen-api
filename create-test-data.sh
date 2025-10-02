#!/bin/bash

# Script para criar dados de teste via API
# Aguarda entre requisições para evitar rate limit

API_URL="http://localhost:3333/api/v1/mood/entries"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNDU3N2M3NC1hNzRhLTRkMDMtOTQwMS00OWVjNDg2YTA1ZDkiLCJlbWFpbCI6InRlc3RlMkBwdWxzZXplbi5jb20iLCJpYXQiOjE3NTk0MjM3MTAsImV4cCI6MTc1OTQyNDYxMH0.5RRb73x7vWxKW1R8YjSIcQOCtltFfCo6U8x0efzlKUg"

echo "🚀 Criando dados de teste para predições..."

# Lista de entradas para criar
entries=(
  '{"mood_level": "mal", "period": "noite"}'
  '{"mood_level": "pessimo", "period": "manha"}'
  '{"mood_level": "neutro", "period": "tarde"}'
  '{"mood_level": "bem", "period": "noite"}'
  '{"mood_level": "excelente", "period": "manha"}'
)

for entry in "${entries[@]}"; do
  echo "📝 Criando entrada: $entry"
  
  response=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$entry")
  
  echo "✅ Resposta: $response"
  echo "⏳ Aguardando 65 segundos para evitar rate limit..."
  sleep 65
done

echo "🎉 Dados de teste criados! Agora podemos testar as predições."
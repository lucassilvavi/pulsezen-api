#!/bin/bash
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 PulseZen API - Setup do Ambiente Docker${NC}"
echo "=================================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    echo -e "${YELLOW}💡 Instale Docker Desktop: https://www.docker.com/products/docker-desktop/${NC}"
    echo -e "${YELLOW}💡 Ou via Homebrew: brew install --cask docker${NC}"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo -e "${YELLOW}💡 Inicie Docker Desktop ou execute: colima start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está disponível${NC}"

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Criando arquivo .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

# Parar containers existentes (se houver)
echo -e "${YELLOW}🔄 Parando containers existentes...${NC}"
docker compose down 2>/dev/null || true

# Iniciar serviços
echo -e "${YELLOW}🚀 Iniciando serviços Docker...${NC}"
docker compose up -d

# Aguardar PostgreSQL estar pronto
echo -e "${YELLOW}⏳ Aguardando PostgreSQL estar pronto...${NC}"
sleep 10

# Verificar se PostgreSQL está aceitando conexões
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U pulsezen -q; then
        echo -e "${GREEN}✅ PostgreSQL está pronto!${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Aguardando PostgreSQL... (${i}/30)${NC}"
    sleep 2
done

# Verificar status dos containers
echo -e "${BLUE}📊 Status dos containers:${NC}"
docker compose ps

# Executar migrações
echo -e "${YELLOW}🗄️ Executando migrações...${NC}"
if DB_DATABASE=pulsezen_dev node ace migration:run; then
    echo -e "${GREEN}✅ Migrações executadas com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao executar migrações${NC}"
    echo -e "${YELLOW}💡 Tente executar manualmente: node ace migration:run${NC}"
fi

# Executar seeders
echo -e "${YELLOW}🌱 Executando seeders...${NC}"
if DB_DATABASE=pulsezen_dev node ace db:seed; then
    echo -e "${GREEN}✅ Seeders executados com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao executar seeders${NC}"
    echo -e "${YELLOW}💡 Tente executar manualmente: node ace db:seed${NC}"
fi

# Mostrar informações dos serviços
echo -e "${BLUE}🎯 Serviços disponíveis:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🌐 API:${NC}           http://localhost:3333"
echo -e "${GREEN}🐘 PostgreSQL:${NC}    localhost:5432 (pulsezen:pulsezen123)"
echo -e "${GREEN}📊 pgAdmin:${NC}       http://localhost:8080 (admin@pulsezen.com:admin123)"
echo -e "${GREEN}🔴 Redis:${NC}         localhost:6379"
echo -e "${GREEN}🔍 Elasticsearch:${NC} http://localhost:9200"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${YELLOW}📝 Configuração pgAdmin:${NC}"
echo "   Host: postgres (não localhost!)"
echo "   Port: 5432"
echo "   Database: postgres"
echo "   Username: pulsezen"
echo "   Password: pulsezen123"
echo ""

echo -e "${YELLOW}🚀 Para iniciar a aplicação:${NC}"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}🧪 Para executar testes:${NC}"
echo "   npm test"
echo ""
echo -e "${YELLOW}📈 Para ver coverage:${NC}"
echo "   npm run test:coverage"
echo ""
echo -e "${GREEN}✨ Ambiente Docker configurado com sucesso!${NC}"

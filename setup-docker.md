# Setup do Ambiente Docker - PulseZen API

## 🐳 Instalação do Docker

### macOS
```bash
# Opção 1: Docker Desktop (recomendado)
# Baixe e instale Docker Desktop em: https://www.docker.com/products/docker-desktop/

# Opção 2: Via Homebrew
brew install --cask docker

# Ou apenas Docker CLI + Colima (mais leve)
brew install docker colima
colima start
```

## 🚀 Iniciando o Ambiente

### 1. Verificar se Docker está funcionando
```bash
docker --version
docker compose version
```

### 2. Iniciar os serviços
```bash
cd /Users/lucas/Documents/pulsezen/pulsezen-api
docker compose up -d
```

### 3. Verificar status dos containers
```bash
docker compose ps
```

### 4. Executar migrações do banco
```bash
# Aguarde os containers iniciarem (30-60 segundos), depois:
node ace migration:run
```

### 5. Executar seeders (dados iniciais)
```bash
node ace db:seed
```

### 6. Iniciar a aplicação
```bash
npm run dev
```

## 📊 Serviços Disponíveis

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **API** | http://localhost:3333 | - |
| **PostgreSQL** | localhost:5432 | `pulsezen:pulsezen123` |
| **pgAdmin** | http://localhost:8080 | `admin@pulsezen.com:admin123` |
| **Redis** | localhost:6379 | - |
| **Elasticsearch** | http://localhost:9200 | - |

### 🔧 Configuração pgAdmin

Para conectar ao PostgreSQL no pgAdmin, use:

- **Host name/address:** `postgres` (nome do container)
- **Port:** `5432`
- **Maintenance database:** `postgres`
- **Username:** `pulsezen`
- **Password:** `pulsezen123`

⚠️ **Importante:** Use `postgres` como host, não `localhost` ou `127.0.0.1`!

## 🔧 Comandos Úteis

### Logs dos containers
```bash
docker compose logs -f                    # Todos os serviços
docker compose logs -f postgres          # Apenas PostgreSQL
docker compose logs -f api               # Apenas API (quando containerizada)
```

### Parar serviços
```bash
docker compose down                       # Para todos os containers
docker compose down -v                   # Para e remove volumes (CUIDADO: apaga dados!)
```

### Acessar banco diretamente
```bash
docker compose exec postgres psql -U pulsezen -d pulsezen_dev
```

### Resetar ambiente
```bash
docker compose down -v
docker compose up -d
# Aguarde inicializar, depois:
node ace migration:run
node ace db:seed
```

## 🐛 Troubleshooting

### Container PostgreSQL não inicia
```bash
# Verificar logs
docker compose logs postgres

# Limpar volumes e reiniciar
docker compose down -v
docker volume prune -f
docker compose up -d
```

### Erro de conexão com banco
```bash
# Verificar se containers estão rodando
docker compose ps

# Verificar se banco aceita conexões
docker compose exec postgres pg_isready -U pulsezen
```

### Porta em uso
```bash
# Verificar processos usando as portas
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5050  # pgAdmin
lsof -i :9200  # Elasticsearch

# Matar processo se necessário
kill -9 <PID>
```

## 🎯 Próximos Passos

1. **Instalar Docker** se ainda não tiver
2. **Executar** `docker compose up -d`
3. **Aguardar** containers iniciarem (1-2 minutos)
4. **Executar** migrações: `node ace migration:run`
5. **Executar** seeders: `node ace db:seed`
6. **Iniciar** aplicação: `npm run dev`
6. **Testar** endpoint: `curl http://localhost:3333/health`

## 🏗️ Ambiente de Produção

O `docker-compose.yml` está configurado para **desenvolvimento**. Para produção:

- Remover pgAdmin e Elasticsearch se não necessários
- Usar volumes persistentes externos
- Configurar backup automático
- Usar secrets para senhas
- Configurar SSL/TLS
- Implementar monitoring

## 📝 Configuração Atual

### PostgreSQL 15
- **Database**: `pulsezen_dev`
- **Test DB**: `pulsezen_test`
- **Extensions**: `uuid-ossp`, `pg_trgm` (para full-text search)
- **Performance**: Configurado para desenvolvimento local

### Seeds (Dados Iniciais)
- **Categorias de Música**: 3 categorias (Histórias, Sons, Meditações)
- **Faixas de Música**: 9 tracks de exemplo com metadados completos
- **Comando**: `node ace db:seed` (incluso no setup automático)

### Redis
- **Uso**: Cache, sessões, rate limiting
- **Configuração**: Padrão para desenvolvimento

### Elasticsearch
- **Uso**: Full-text search avançado (opcional)
- **Configuração**: Single-node para desenvolvimento

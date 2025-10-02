# 🔧 Configuração da Pipeline GitHub Actions

## Status Atual ✅
- ✅ Workflow `deploy.yml` criado
- ✅ Repositório conectado ao GitHub
- ✅ Dockerfile configurado
- ⏳ **Próximo passo: Configurar secrets**

## Configuração via Interface Web (5 minutos)

### 1. Acessar GitHub Secrets
```
🌐 https://github.com/lucassilvavi/pulsezen-api/settings/secrets/actions
```

### 2. Obter Railway Token
1. Acesse: https://railway.app/account/tokens
2. Clique "Create New Token"
3. Nome: `GitHub Actions - PulseZen API`
4. Copie o token

### 3. Adicionar Secret no GitHub
1. Clique "New repository secret"
2. Name: `RAILWAY_TOKEN`
3. Secret: Cole o token do Railway
4. Clique "Add secret"

## Configuração via Terminal

### Script Automático
```bash
# Executar script de configuração
./setup-github-secrets.sh
```

### Comandos Manuais (se preferir)
```bash
# 1. Login GitHub CLI
gh auth login

# 2. Adicionar secret (substitua YOUR_TOKEN)
echo "YOUR_RAILWAY_TOKEN" | gh secret set RAILWAY_TOKEN

# 3. Verificar
gh secret list
```

## Testar Pipeline

### Trigger Deploy
```bash
# Fazer qualquer alteração e push
echo "# Test" >> README.md
git add .
git commit -m "🧪 Test GitHub Actions pipeline"
git push
```

### Acompanhar Execução
```
🌐 https://github.com/lucassilvavi/pulsezen-api/actions
```

## Pipeline Configurada

### Triggers
- ✅ Push para `main`
- ✅ Pull Request para `main`

### Jobs
1. **test**: Linting, build, testes
2. **deploy**: Deploy automático no Railway

### Secrets Necessários
- `RAILWAY_TOKEN`: Token de acesso do Railway

## Próximos Passos

1. ⚡ **Configurar Railway Token** (acima)
2. 🚀 **Criar projeto no Railway**
3. 🔗 **Conectar repositório**
4. 🧪 **Testar deploy**

## Comandos Úteis

```bash
# Ver status do workflow
gh run list

# Ver logs do último run
gh run view --log

# Re-executar último workflow
gh run rerun
```
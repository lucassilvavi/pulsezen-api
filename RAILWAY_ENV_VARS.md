# Railway Environment Variables Setup Guide

## Required Environment Variables

Configure these variables in Railway dashboard:

### Core Application
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=$PORT` (Railway automatically sets this)
- `LOG_LEVEL=info`

### App Security
- `APP_KEY=your-super-secret-app-key-32-chars-long`

### Database (Railway PostgreSQL)
Based on your Railway PostgreSQL credentials:
- `DB_CONNECTION=postgres`
- `DB_HOST=interchange.proxy.rlwy.net`
- `DB_PORT=34438`
- `DB_USER=postgres`
- `DB_PASSWORD=cDHpPDyvqvRIgDcwrNjsOSJbnmChMWyr`
- `DB_DATABASE=railway` (or your database name)

**Note**: Railway also provides these as automatic variables:
- `$PGHOST`, `$PGPORT`, `$PGUSER`, `$PGPASSWORD`, `$PGDATABASE`

### Authentication
- `JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters`

## Quick Setup Commands

For Railway CLI:
```bash
railway variables set NODE_ENV=production
railway variables set HOST=0.0.0.0
railway variables set LOG_LEVEL=info
railway variables set APP_KEY=$(openssl rand -hex 16)
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set DB_CONNECTION=postgres
```

## Manual Setup (Railway Dashboard)

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add each variable from the list above
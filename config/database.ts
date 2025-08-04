import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION', 'postgres'),
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST', 'localhost'),
        port: Number(env.get('DB_PORT', '5432')),
        user: env.get('DB_USER', 'pulsezen'),
        password: env.get('DB_PASSWORD', 'pulsezen123'),
        database: env.get('DB_DATABASE', 'pulsezen_dev'),
        ssl: env.get('DB_SSL_ENABLED', false) ? {
          rejectUnauthorized: false
        } : false,
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      seeders: {
        paths: ['database/seeders'],
      },
      debug: env.get('NODE_ENV') === 'development',
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
    },
    
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: env.get('DB_DATABASE', './database/database.sqlite'),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: env.get('NODE_ENV') === 'development',
    },
  },
})

export default dbConfig
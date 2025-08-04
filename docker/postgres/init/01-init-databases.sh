#!/bin/bash
set -e

# Create additional databases for test environments
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create test database
    CREATE DATABASE pulsezen_test;
    
    -- Create staging database  
    CREATE DATABASE pulsezen_staging;
    
    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE pulsezen_test TO pulsezen;
    GRANT ALL PRIVILEGES ON DATABASE pulsezen_staging TO pulsezen;
    
    -- Create extensions for full-text search
    \c pulsezen_dev;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";
    
    \c pulsezen_test;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";
    
    \c pulsezen_staging;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";
EOSQL

echo "PostgreSQL databases and extensions created successfully!"

-- Database initialization script for PulseZen
-- This script runs once when the PostgreSQL container is first created

-- Create test database
CREATE DATABASE pulsezen_test WITH OWNER pulsezen;

-- Connect to main database to create extensions
\c pulsezen_dev;

-- Create necessary extensions for full-text search and UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Connect to test database and create extensions there too
\c pulsezen_test;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant privileges to pulsezen user
GRANT ALL PRIVILEGES ON DATABASE pulsezen_dev TO pulsezen;
GRANT ALL PRIVILEGES ON DATABASE pulsezen_test TO pulsezen;

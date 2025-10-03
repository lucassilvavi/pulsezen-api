FROM node:20-alpine

WORKDIR /app

# Install system dependencies for browser automation and native modules
RUN apk add --no-cache \
    postgresql-client \
    curl \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    wqy-zenhei \
    xvfb \
    dbus \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set environment variables for browser automation
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    DISPLAY=:99

# Install dependencies (including dev for build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Clean up dev dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads

# Set default environment variables for Railway
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    LOG_LEVEL=info \
    DB_CONNECTION=postgres \
    DB_SSL_ENABLED=true \
    APP_KEY=default-app-key-change-in-production \
    JWT_SECRET=default-jwt-secret-change-in-production

# Expose port (Railway will set PORT automatically)
EXPOSE $PORT

# Health check with Railway port
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application using the built version
CMD ["node", "build/bin/server.js"]
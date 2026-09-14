FROM node:20-alpine AS base

WORKDIR /app

# Install build dependencies for native modules (bcrypt, better-sqlite3)
RUN apk add --no-cache python3 make g++

# 1. Setup shared module
WORKDIR /app/shared
COPY shared/package*.json shared/tsconfig.json ./
RUN npm install
COPY shared/src ./src
RUN npm run build

# 2. Setup backend service
WORKDIR /app/backend
COPY backend/package*.json backend/tsconfig*.json backend/nest-cli.json ./
RUN npm install

# Copy backend source code
COPY backend/src ./src

# Expose API port
EXPOSE 3001

# Default command for development (overridden in compose if needed)
CMD ["npm", "run", "start:dev"]

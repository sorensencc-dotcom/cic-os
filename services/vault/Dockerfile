FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

COPY services/vault/package*.json ./
RUN npm install

COPY services/vault/src ./src
COPY services/vault/tsconfig.json ./

RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Install build tools for better-sqlite3 native module
RUN apk add --no-cache python3 make g++ curl

COPY services/vault/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY services/vault/src/db ./dist/db

EXPOSE 3111

CMD ["node", "dist/server.js"]

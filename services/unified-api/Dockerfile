FROM node:20-alpine AS builder
WORKDIR /app

COPY services/unified-api/package*.json ./
RUN npm install

COPY services/unified-api/src ./src
COPY services/unified-api/tsconfig.json ./

RUN npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY services/unified-api/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3100

CMD ["node", "dist/server.js"]

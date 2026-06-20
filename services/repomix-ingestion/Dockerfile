FROM node:20-alpine AS builder
WORKDIR /app

COPY services/repomix-ingestion/package*.json ./
RUN npm install

COPY services/repomix-ingestion/src ./src
COPY services/repomix-ingestion/tsconfig.json ./

RUN npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY services/repomix-ingestion/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3112

CMD ["node", "dist/server.js"]

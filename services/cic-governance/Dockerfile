FROM node:20-alpine AS builder
WORKDIR /app

COPY services/cic-governance/package*.json ./
RUN npm install

COPY services/cic-governance/src ./src
COPY services/cic-governance/tsconfig.json ./

RUN npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY services/cic-governance/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3113

CMD ["node", "dist/index.js"]

FROM node:20-alpine
WORKDIR /app

COPY services/unified-api/package.json ./
RUN npm install

COPY services/unified-api/src ./src
COPY services/unified-api/tests ./tests
COPY services/unified-api/tsconfig.json ./
COPY services/unified-api/jest.config.cjs ./

RUN npm run build

EXPOSE 3100
CMD ["sh", "-c", "npm start &  sleep 2 && npm test"]

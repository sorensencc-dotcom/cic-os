FROM node:20-alpine
WORKDIR /app

COPY services/repomix-ingestion/package.json ./
RUN npm install

COPY services/repomix-ingestion/src ./src
COPY services/repomix-ingestion/tests ./tests
COPY services/repomix-ingestion/tsconfig.json ./
COPY services/repomix-ingestion/jest.config.js ./

RUN npm run build

EXPOSE 3112
CMD ["npm", "test"]

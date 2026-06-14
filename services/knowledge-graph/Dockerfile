FROM node:20-alpine

WORKDIR /app

COPY services/knowledge-graph/package.json ./
RUN npm install

COPY services/knowledge-graph/src ./src
COPY services/knowledge-graph/tests ./tests
COPY services/knowledge-graph/tsconfig.json ./
COPY services/knowledge-graph/jest.config.js ./

RUN npm run build

EXPOSE 3107

CMD ["npm", "test"]

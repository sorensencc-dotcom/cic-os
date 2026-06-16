FROM node:20
WORKDIR /app

# Install Python for better-sqlite3 native module build
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

COPY services/knowledge-graph/package.json ./
RUN npm install

COPY services/knowledge-graph/src ./src
COPY services/knowledge-graph/tests ./tests
COPY services/knowledge-graph/tsconfig.json ./
COPY services/knowledge-graph/jest.config.js ./

RUN npm run build

EXPOSE 3107

CMD ["npm", "test"]

FROM node:20
WORKDIR /app

# Install Python for better-sqlite3 native module build
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

COPY services/vault/package.json ./
RUN npm install

COPY services/vault/src ./src
COPY services/vault/tests ./tests
COPY services/vault/tsconfig.json ./
COPY services/vault/jest.config.js ./

RUN npm run build

EXPOSE 3111
CMD ["npm", "test"]

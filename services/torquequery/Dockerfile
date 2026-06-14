FROM node:20
WORKDIR /app

# Install Python for better-sqlite3 native module build
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

COPY services/torquequery/package.json ./
RUN npm install

COPY services/torquequery/src ./src
COPY services/torquequery/tests ./tests
COPY services/torquequery/tsconfig.json ./
COPY services/torquequery/jest.config.js ./

RUN npm run build

EXPOSE 3110
CMD ["npm", "test"]

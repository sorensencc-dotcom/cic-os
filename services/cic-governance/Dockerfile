FROM node:20-alpine
WORKDIR /app

COPY services/cic-governance/package.json ./
RUN npm install

COPY services/cic-governance/src ./src
COPY services/cic-governance/tests ./tests
COPY services/cic-governance/tsconfig.json ./
COPY services/cic-governance/jest.config.js ./

RUN npm run build

EXPOSE 3113
CMD ["npm", "test"]

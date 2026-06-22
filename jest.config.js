export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  roots: ["<rootDir>/cic", "<rootDir>/src", "<rootDir>/cic-runtime", "<rootDir>/cic-ingestion"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx", "**/runtime/tests/**/*.test.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.css$": "<rootDir>/jest-mock-css.js"
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      useESM: true
    }],
    "^.+\\.js$": ["ts-jest", { useESM: true }]
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"
  ],
  collectCoverageFrom: [
    "cic/src/**/*.ts",
    "!cic/src/**/*.test.ts",
    "!**/node_modules/**"
  ],
  testTimeout: 90000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  extensionsToTreatAsEsm: [".ts"]
};

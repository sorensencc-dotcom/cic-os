export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/cic", "<rootDir>/src", "<rootDir>/cic-runtime", "<rootDir>/cic-ingestion"],
  testMatch: ["**/*.test.ts", "**/runtime/tests/**/*.test.js", "cic-runtime/**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
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
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  extensionsToTreatAsEsm: [".ts"]
};

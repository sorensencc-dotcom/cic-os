export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/cic", "<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/runtime/tests/**/*.test.js"],
  extensionsToTreatAsEsm: [".js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.js$": ["ts-jest", { useESM: true }]
  },
  collectCoverageFrom: [
    "cic/src/**/*.ts",
    "!cic/src/**/*.test.ts",
    "!**/node_modules/**"
  ],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true
};

export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  roots: ["<rootDir>/src", "<rootDir>/cic-runtime", "<rootDir>/cic-ingestion", "<rootDir>/cic-ui"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: [
    "/cic-runtime/integration\\.test\\.ts",
    "/aperture/(sandbox|orchestrator|__tests__)/",
    "cic-ingestion/src/vector/__tests__",
    "cic-ingestion/src/wayland/__tests__",
    "cic-ingestion/src/extractors/(browser|sweeper)"
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.css$": "<rootDir>/jest-mock-css.js"
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      useESM: true,
      isolatedModules: true,
      tsconfig: {
        module: "esnext",
        target: "esnext"
      }
    }]
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uuid|@paralleldrive|@noble|cuid2|node-cron)/)"
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

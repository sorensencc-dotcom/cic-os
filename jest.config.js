export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.test.ts",
    "!node_modules/**"
  ],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true
};

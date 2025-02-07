/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest", // Uses ts-jest for TypeScript support
  testEnvironment: "node", // Sets the test environment to Node.js
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true, // Move isolatedModules here
      },
    ],
  },
  testMatch: ["<rootDir>/src/test/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/config/"],
};

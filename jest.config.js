/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  reporters: [['github-actions', { silent: false }], 'summary', 'jest-junit'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    "bin/"
  ],
  "globalSetup": "./src/tests/globalSetup.ts",
  "globalTeardown": "./src/tests/globalTeardown.ts",
  "setupFilesAfterEnv": [
    "./src/tests/setupFile.ts"
  ]
};
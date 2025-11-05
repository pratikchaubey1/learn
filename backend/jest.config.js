/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};

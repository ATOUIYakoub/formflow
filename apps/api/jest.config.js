module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
    // Several @nestjs/* packages (config, jwt, passport, bullmq) ship ESM only.
    // Jest runs the suite as CommonJS, so Babel transpiles them down.
    // The separator class is required: on Windows these paths use backslashes
    // and a `/`-only pattern silently never matches.
    'node_modules[\\\\/](@nestjs|rxjs)[\\\\/].*\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules[\\\\/](?!(@nestjs|rxjs)[\\\\/])'],
  cacheDirectory: '<rootDir>/.jest-cache',
  moduleDirectories: ['node_modules', '<rootDir>'],
};
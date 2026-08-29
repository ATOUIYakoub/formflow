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
    'node_modules/@nestjs/.*': 'babel-jest',
    'node_modules/@nestjs/config/.*': 'babel-jest',
    'node_modules/rxjs/.*': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@nestjs|rxjs)/)',
  ],
  cacheDirectory: '<rootDir>/.jest-cache',
  moduleDirectories: ['node_modules', '<rootDir>'],
};
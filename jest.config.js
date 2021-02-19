'use strict'

module.exports = {
  verbose: true,
  collectCoverage: false,
  restoreMocks: true,
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testEnvironment: 'node',
  rootDir: __dirname,
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  },
  reporters: ['default'],
  watchPathIgnorePatterns: ['coverage'],
  projects: ['<rootDir>'],
  collectCoverageFrom: [
    '**/pkgs/*/**/*.ts',
    '!**/pkgs/*/**/*.js',
    '!**/bin/**',
    '!**/__mocks__/**',
    '!**/__tests__/**',
    '!**/build/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/dist-es5/**'
  ],
  modulePathIgnorePatterns: [
    'examples/.*',
    'benchmarks/.*',
    'pkgs/.*/dist',
    'pkgs/.*/dist-es5',
    'pkgs/.*/tsconfig.*',
    'internal/clinic/*'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/benchmarks/',
    '/examples/',
    '/dist/',
    '/dist-es5/',
    '/pkgs/.*/dist',
    '/pkgs/.*/dist-es5',
    '/pkgs/drizzle-http-fetch',
    'internal/clinic/*'
  ],
  moduleNameMapper: {
    '@drizzle-http/test-utils(.*)$': '<rootDir>/internal/test-utils/src/$1',
    '@drizzle-http/core(.*)$': '<rootDir>/pkgs/drizzle-http/src/$1',
    '@drizzle-http/undici(.*)$': '<rootDir>/pkgs/drizzle-http-undici/src/$1',
    '@drizzle-http/rxjs-adapter(.*)$': '<rootDir>/pkgs/drizzle-http-rxjs-adapter/src/$1',
    '@drizzle-http/fetch(.*)$': '<rootDir>/pkgs/drizzle-http-fetch/src/$1',
    '@drizzle-http/logging-interceptor(.*)$': '<rootDir>/pkgs/drizzle-http-logging-interceptor/src/$1'
  }
}

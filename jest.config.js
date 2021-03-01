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
    '!**/out/**',
    '!scripts/*'
  ],
  coveragePathIgnorePatterns: [
    'drizzle-http-fetch/src/test',
    'drizzle-http-core/src/internal/http/test',
    '/node_modules/'
  ],
  modulePathIgnorePatterns: [
    'dist',
    'dist-*',
    'examples/*',
    'benchmarks/*',
    'scripts/*',
    'pkgs/.*/dist',
    'pkgs/.*/out',
    'pkgs/.*/tsconfig.*',
    'internal/clinic/*'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/benchmarks/',
    '/examples/',
    '/dist/',
    '/out/',
    '/pkgs/.*/dist',
    'internal/clinic/*',
    '/scripts/'
  ]
}

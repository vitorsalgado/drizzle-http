import type { Config as JestConfig } from '@jest/types'
import 'dotenv/config'

const config: JestConfig.InitialOptions = {
  verbose: true,
  collectCoverage: false,
  restoreMocks: true,
  resetMocks: true,
  projects: ['<rootDir>'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  },
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

export default config

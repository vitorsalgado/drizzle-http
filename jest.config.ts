import type { Config as JestConfig } from '@jest/types'
import Base from './jest-base.config'

const config: JestConfig.InitialOptions = {
  ...Base,

  projects: ['<rootDir>'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
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
    'drizzle-http-core/src/internal/net/http/test',
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
    'pkgs/clinic/*'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/benchmarks/',
    '/examples/',
    '/dist/',
    '/out/',
    '/pkgs/.*/dist',
    'pkgs/clinic/*',
    '/scripts/'
  ]
}

export default config

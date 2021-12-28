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
    '!**/bin/**',
    '!**/__mocks__/**',
    '!**/__tests__/**',
    '!**/build/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/out/**',
    '!scripts/*'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: [
    'dist',
    'dist-*',
    'examples/*',
    'benchmarks/*',
    'scripts/*',
    'packages/.*/dist',
    'packages/.*/out',
    'packages/.*/tsconfig.*',
    'internal/*'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/benchmarks/',
    '/examples/',
    '/dist/',
    '/out/',
    'internal/*',
    'scripts/*',
    'packages/drizzle-fetch'
  ]
}

export default config

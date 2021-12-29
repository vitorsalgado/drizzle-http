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
  testMatch: ['**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['packages/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/', '/drizzle-fetch/', 'packages/.*/index.ts'],
  modulePathIgnorePatterns: [
    'dist',
    'coverage',
    'examples/*',
    'benchmarks/*',
    'scripts/*',
    'packages/.*/dist',
    'packages/.*/coverage',
    'packages/.*/out',
    'packages/.*/tsconfig.*',
    'packages/.*/jest.config*',
    'packages/.*/package-*.json',
    'internal/*'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/benchmarks/',
    '/examples/',
    '/dist/',
    '/out/',
    '/coverage/',
    'internal/*',
    'scripts/*',
    'packages/.*/jest.config*',
    'packages/.*/index.ts',
    'packages/.*/package-*.json',
    'packages/drizzle-fetch'
  ]
}

export default config

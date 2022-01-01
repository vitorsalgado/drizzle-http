import type { Config as JestConfig } from '@jest/types'
import 'dotenv/config'

const config: JestConfig.InitialOptions = {
  verbose: true,
  testTimeout: 15000,
  collectCoverage: false,
  resetModules: true,
  restoreMocks: true,
  testMatch: ['**/__tests__/?(*.)+(spec|test).ts'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  globals: {
    'ts-jest': {
      tsconfig: '../../tsconfig.test.json'
    }
  },
  coveragePathIgnorePatterns: ['/dist/', '<rootDit>/dist', '/node_modules/', '<rootDir>/examples'],
  testPathIgnorePatterns: ['/dist/', '<rootDit>/dist', '/node_modules/', '<rootDir>/examples']
}

export default config

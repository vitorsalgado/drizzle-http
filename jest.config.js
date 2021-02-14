module.exports = {
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testEnvironment: 'node',
  rootDir: __dirname,
  watchPathIgnorePatterns: ['coverage'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  },
  restoreMocks: true,
  reporters: ['default'],
  modulePathIgnorePatterns: ['dist', 'benchmarks', 'test', 'docs'],
  moduleNameMapper: {
    '@drizzle-http/test-utils(.*)$': '<rootDir>/internal/test-utils/src/$1',
    '@drizzle-http/core(.*)$': '<rootDir>/pkgs/drizzle-http/src/$1',
    '@drizzle-http/undici(.*)$': '<rootDir>/pkgs/drizzle-http-undici/src/$1',
    '@drizzle-http/rxjs-adapter(.*)$': '<rootDir>/pkgs/drizzle-http-rxjs-adapter/src/$1',
    '@drizzle-http/fetch(.*)$': '<rootDir>/pkgs/drizzle-http-fetch/src/$1',
    '@drizzle-http/logging-interceptor(.*)$': '<rootDir>/pkgs/drizzle-http-logging-interceptor/src/$1'
  },
  collectCoverage: false
}

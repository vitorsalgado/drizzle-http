import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@drizzle-http/monorepo',
    globals: true,
    environment: 'node',
    setupFiles: ['dotenv/config'],
    testTimeout: 15000,
    restoreMocks: false,
    include: ['**/__tests__/**/*.{spec,test}.ts', 'test/**/*.spec.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/examples/**',
      '**/benchmarks/**',
      '**/internal/**',
      '**/scripts/**',
      'packages/drizzle-fetch/**'
    ],
    coverage: {
      provider: 'v8',
      include: ['packages/**'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        'packages/drizzle-fetch/**',
        'packages/**/index.ts'
      ]
    },
    pool: 'forks'
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true
      }
    }
  }
})

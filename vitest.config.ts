import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  esbuild: false,
  resolve: {
    alias: {
      '@drizzle-http/core': path.join(root, 'packages/drizzle-core/index.ts')
    }
  },
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true
        },
        transform: {
          legacyDecorator: false,
          decoratorMetadata: true,
          decoratorVersion: '2022-03'
        },
        target: 'es2022'
      }
    })
  ],
  test: {
    name: '@drizzle-http/monorepo',
    globals: true,
    environment: 'node',
    setupFiles: ['dotenv/config'],
    testTimeout: 15000,
    restoreMocks: false,
    include: ['**/_tests/**/*.test.ts', 'internal/test/**/*.test.ts', 'packages/**/e2e/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/_examples/**',
      '**/_benchmarks/**',
      'internal/test-utils/**',
      'internal/clinic/**',
      '**/scripts/**',
      'packages/drizzle-core/builtin/fetch/e2e/**'
    ],
    coverage: {
      provider: 'v8',
      include: ['packages/**'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        'packages/**/index.ts'
      ]
    },
    pool: 'forks'
  }
})

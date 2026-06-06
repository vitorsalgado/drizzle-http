import eslintConfigPrettier from 'eslint-config-prettier'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import importX from 'eslint-plugin-import-x'
import tsdoc from 'eslint-plugin-tsdoc'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const importRules = {
  'import-x/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object']
    }
  ],
  'import-x/extensions': [
    'error',
    'ignorePackages',
    {
      js: 'always',
      jsx: 'always',
      mjs: 'always',
      ts: 'never',
      tsx: 'never'
    }
  ],
  'import-x/no-named-as-default': 'off',
  'import-x/no-duplicates': 'off',
  'import-x/no-mutable-exports': 'error',
  'import-x/no-useless-path-segments': [
    'error',
    {
      noUselessIndex: false
    }
  ],
  'import-x/no-self-import': 'error',
  'import-x/export': 'error',
  'import-x/no-deprecated': 'error',
  'import-x/no-commonjs': 'error'
}

const importSettings = {
  'import-x/resolver-next': [
    createTypeScriptImportResolver({
      alwaysTryTypes: true
    })
  ]
}

export default tseslint.config(
  {
    ignores: [
      '.github/**',
      '.yarn/**',
      '_benchmarks/**',
      '_examples/**',
      'coverage/**',
      '**/dist/**',
      'docs/**',
      'node_modules/**',
      '**/*.d.ts',
      '**/*.cjs',
      'commitlint.config.cjs',
      'packages/drizzle-core/builtin/fetch/build/**',
      'packages/drizzle-core/builtin/fetch/e2e/**',
      'packages/drizzle-core/builtin/fetch/playwright.config.ts'
    ]
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.ts'],
    plugins: {
      tsdoc,
      'import-x': importX
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    settings: importSettings,
    rules: {
      'tsdoc/syntax': 'error',

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-dupe-class-members': 'error',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['decoratedFunctions'] }],
      '@typescript-eslint/no-useless-constructor': 'error',

      ...importRules
    }
  },
  {
    files: ['**/_tests/**/*.ts', '**/*.test.ts', 'internal/test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest
      }
    }
  },
  {
    files: ['packages/drizzle-core/builtin/fetch/**/*.ts'],
    ignores: ['packages/drizzle-core/builtin/fetch/_tests/**'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: ['scripts/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    plugins: {
      'import-x': importX
    },
    settings: importSettings,
    rules: {
      ...importRules
    }
  }
)

#!/usr/bin/env node

import FsExt from 'fs-extra'
import { globby } from 'globby'

const cleanupTargets = await globby(
  [
    'benchmarks/dist',
    'internal/*/dist',
    'packages/*/dist',
    'examples/*/dist',
    'test/dist',
    '**/tsconfig.build.tsbuildinfo',
    'examples/nestjs/dist/tsconfig.tsbuildinfo',
    'jest.config.js',
    'jest.config.js.map',
    'jest.config.d.ts',
    'jest-base.config.js',
    'jest-base.config.js.map',
    'jest-base.config.d.ts',
    'jest-base.config.d.ts.map',
    'examples/nestjs/src/**/*.js',
    'examples/nestjs/src/**/*.js.map',
    'examples/react/http/index.js',
    'examples/react/http/index.js.map',
    'examples/react/http/index.d.ts',
    'examples/react/http/index.d.ts.map'
  ],
  { cwd: process.cwd(), onlyDirectories: false, absolute: true }
)

for (const target of cleanupTargets) {
  await FsExt.remove(target)
}

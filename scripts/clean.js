#!/usr/bin/env node

import FsExt from 'fs-extra'
import { globby } from 'globby'

const cleanupTargets = await globby(
  [
    '_benchmarks/dist',
    'internal/*/dist',
    'packages/*/dist',
    '_examples/*/dist',
    'test/dist',
    '**/tsconfig.build.tsbuildinfo',
    '_examples/nestjs/dist/tsconfig.tsbuildinfo',
    '_examples/nestjs/src/**/*.js',
    '_examples/nestjs/src/**/*.js.map',
    '_examples/react/http/index.js',
    '_examples/react/http/index.js.map',
    '_examples/react/http/index.d.ts',
    '_examples/react/http/index.d.ts.map'
  ],
  { cwd: process.cwd(), onlyDirectories: false, absolute: true }
)

for (const target of cleanupTargets) {
  await FsExt.remove(target)
}

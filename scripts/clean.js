#!/usr/bin/env node

import FsExt from 'fs-extra'
import { globby } from 'globby'

const distDirs = await globby(
  ['benchmarks/dist', 'internal/*/dist', 'packages/*/dist', 'examples/*/dist', 'test/dist'],
  { cwd: process.cwd(), onlyDirectories: true, absolute: true }
)

for (const dir of distDirs) {
  await FsExt.remove(dir)
}

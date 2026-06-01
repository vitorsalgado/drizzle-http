#!/usr/bin/env node

import Fs from 'fs'
import Path from 'path'
import { globby } from 'globby'

const SKIP = new Set(['_examples/nestjs/package.json', '_examples/javascript/package.json'])

const pkgRefs = await globby(
  [
    'packages/*/package.json',
    'internal/*/package.json',
    '_benchmarks/package.json',
    'test/package.json',
    '_examples/*/package.json'
  ],
  { cwd: process.cwd(), absolute: true, ignore: ['**/node_modules/**'] }
)

for (const pkgRef of pkgRefs) {
  const relative = Path.relative(process.cwd(), pkgRef)

  if (SKIP.has(relative)) {
    continue
  }

  const pkg = JSON.parse(Fs.readFileSync(pkgRef, 'utf8'))
  pkg.type = 'module'

  if (pkg.exports?.['.']?.require) {
    delete pkg.exports['.'].require
  }

  if (!pkg.exports && pkg.main) {
    pkg.exports = {
      '.': {
        types: pkg.types ?? './dist/index.d.ts',
        import: pkg.main.startsWith('.') ? pkg.main : `./${pkg.main}`,
        default: pkg.main.startsWith('.') ? pkg.main : `./${pkg.main}`
      },
      './package.json': './package.json'
    }
  }

  Fs.writeFileSync(pkgRef, `${JSON.stringify(pkg, null, 2)}\n`)
  console.log(`Updated ${relative}`)
}

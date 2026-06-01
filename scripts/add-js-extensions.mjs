#!/usr/bin/env node

import Fs from 'fs'
import Path from 'path'
import { globby } from 'globby'

const SPECIFIER_RE =
  /(\bfrom\s|\bexport\s+\*\s+from\s|\bimport\s*\()(['"])(\.\.?(?:\/[^'"]*)?)\2/g

const IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  'examples/nestjs/**',
  'packages/drizzle-fetch/e2e/**'
]

function resolveSpecifier(fromFile, specifier) {
  if (/\.(js|json|node|css|wasm)$/.test(specifier)) {
    return null
  }

  const fromDir = Path.dirname(fromFile)
  const absolute = Path.resolve(fromDir, specifier)

  if (Fs.existsSync(`${absolute}.ts`) || Fs.existsSync(`${absolute}.tsx`)) {
    return `${specifier}.js`
  }

  if (Fs.existsSync(Path.join(absolute, 'index.ts'))) {
    const normalized = specifier.replace(/\/$/, '')
    return `${normalized}/index.js`
  }

  return `${specifier}.js`
}

function transformFile(filePath) {
  const original = Fs.readFileSync(filePath, 'utf8')
  let changed = false

  const updated = original.replace(SPECIFIER_RE, (match, prefix, quote, specifier) => {
    const resolved = resolveSpecifier(filePath, specifier)
    if (!resolved || resolved === specifier) {
      return match
    }

    changed = true
    return `${prefix}${quote}${resolved}${quote}`
  })

  if (changed) {
    Fs.writeFileSync(filePath, updated)
  }

  return changed
}

const files = await globby(['**/*.ts', '**/*.tsx'], {
  cwd: process.cwd(),
  absolute: true,
  ignore: IGNORE,
  gitignore: true
})

let changedCount = 0

for (const file of files) {
  if (transformFile(file)) {
    changedCount++
  }
}

console.log(`Updated ${changedCount} files`)

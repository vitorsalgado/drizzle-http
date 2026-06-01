#!/usr/bin/env node

import Fs from 'fs'
import Path from 'path'
import { globby } from 'globby'

const TEST_EXCLUDES = [
  '**/_tests/**',
  '**/__fixtures__/**',
  '**/*.spec.ts',
  '**/*.spec.js',
  '**/*.config.ts'
]

const configs = await globby(['packages/*/tsconfig.json', 'internal/*/tsconfig.json'], {
  ignore: ['**/node_modules/**']
})

for (const configPath of configs) {
  const config = JSON.parse(Fs.readFileSync(configPath, 'utf8'))
  const exclude = new Set([...(config.exclude ?? []), ...TEST_EXCLUDES])
  config.exclude = [...exclude]
  Fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  console.log(`Updated ${configPath}`)
}

const buildConfigs = await globby(['**/tsconfig.build.json'], {
  ignore: ['**/node_modules/**']
})

for (const buildPath of buildConfigs) {
  const dir = Path.dirname(buildPath)
  const mainPath = Path.join(dir, 'tsconfig.json')

  if (!Fs.existsSync(mainPath)) {
    continue
  }

  const main = JSON.parse(Fs.readFileSync(mainPath, 'utf8'))
  const build = JSON.parse(Fs.readFileSync(buildPath, 'utf8'))

  if (!main.references?.length) {
    continue
  }

  build.references = main.references.map(ref => {
    const refPath = ref.path.endsWith('.json') ? ref.path : Path.join(ref.path, 'tsconfig.build.json')
    const candidate = Path.join(dir, refPath)

    if (Fs.existsSync(candidate)) {
      return { path: refPath.replace(/\\/g, '/') }
    }

    return ref
  })

  Fs.writeFileSync(buildPath, `${JSON.stringify(build, null, 2)}\n`)
  console.log(`Updated references in ${buildPath}`)
}

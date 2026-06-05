import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from '@swc/core'

const root = dirname(fileURLToPath(import.meta.url))
const dist = join(root, 'dist')

const swcConfig = JSON.parse(await readFile(join(root, '.swcrc'), 'utf8'))

async function collectSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name === 'dist' || entry.name === 'data' || entry.name === 'node_modules') {
      continue
    }

    const path = join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(path)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(path)
    }
  }

  return files
}

await rm(dist, { recursive: true, force: true })

for (const sourcePath of await collectSourceFiles(root)) {
  const code = await readFile(sourcePath, 'utf8')
  const output = await transform(code, {
    ...swcConfig,
    filename: sourcePath,
    sourceMaps: true
  })

  const relativePath = relative(root, sourcePath).replace(/\.ts$/, '.js')
  const outputPath = join(dist, relativePath)

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, output.code, 'utf8')

  if (output.map) {
    await writeFile(`${outputPath}.map`, output.map, 'utf8')
  }
}

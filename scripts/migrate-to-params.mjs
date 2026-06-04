#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const PARAM_DECORATORS = new Set([
  'Param',
  'Query',
  'Body',
  'Header',
  'Field',
  'Part',
  'QueryName',
  'Model',
  'BodyKey',
  'StreamTo',
  'Abort'
])

const ROOT = path.resolve(import.meta.dirname, '..')

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'scripts', 'decorators'].includes(entry.name)) {
      continue
    }

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(full, out)
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      out.push(full)
    }
  }

  return out
}

function getSpecText(mod, source) {
  const text = mod.getText(source).trim().replace(/^@/, '')
  const name = text.split('(')[0].split('.')[0]

  if (!PARAM_DECORATORS.has(name)) {
    return null
  }

  if (name === 'Abort') {
    return text.replace(/^Abort/, 'SignalParam')
  }

  return text
}

function addImport(text, name) {
  const m = text.match(/^import\s+\{([^}]+)\}\s+from\s+(['"][^'"]+['"])/m)

  if (!m || new RegExp(`\\b${name}\\b`).test(m[1])) {
    return text
  }

  const specs = m[1].trim().replace(/,\s*$/, '')

  return text.replace(m[0], `import { ${specs}, ${name} } from ${m[2]}`)
}

function migrateFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')

  if (!/@(Param|Query|Body|Header|Field|Part|QueryName|Model|BodyKey|StreamTo|Abort)(\(|(?=\s))/.test(text)) {
    return false
  }

  const source = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const replacements = []
  let needsParams = false
  let needsSignal = false

  const visit = node => {
    if (!ts.isMethodDeclaration(node) || !node.name || !node.body) {
      ts.forEachChild(node, visit)
      return
    }

    const specs = []
    const newParams = []

    for (const param of node.parameters) {
      const keep = []

      for (const mod of param.modifiers ?? []) {
        if (ts.isDecorator(mod)) {
          const spec = getSpecText(mod, source)

          if (spec) {
            specs.push(spec)
            needsParams = true

            if (spec.startsWith('SignalParam')) {
              needsSignal = true
            }

            continue
          }
        }

        keep.push(mod)
      }

      newParams.push(
        ts.factory.updateParameterDeclaration(
          param,
          keep,
          param.dotDotDotToken,
          param.name,
          param.questionToken,
          param.type,
          param.initializer
        )
      )
    }

    if (specs.length === 0) {
      ts.forEachChild(node, visit)
      return
    }

    const start = node.getStart(source)
    const end = node.getEnd()
    const lineStart = text.lastIndexOf('\n', start) + 1
    const indent = text.slice(lineStart, start).match(/^(\s*)/)?.[1] ?? '  '

    const decorators = (node.modifiers ?? []).filter(ts.isDecorator).map(d => `${indent}${d.getText(source)}`)
    const paramsLine = `${indent}@Params([${specs.join(', ')}])`
    const name = node.name.getText(source)
    const paramText = newParams.map(p => printer.printNode(ts.EmitHint.Unspecified, p, source)).join(', ')
    const typeText = node.type ? `: ${node.type.getText(source)}` : ''
    const bodyText = node.body.getText(source)
    const asyncPrefix = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : ''

    const rebuilt = [...decorators, paramsLine, `${indent}${asyncPrefix}${name}(${paramText})${typeText} ${bodyText}`].join('\n')

    replacements.push({ start, end, rebuilt })
    ts.forEachChild(node, visit)
  }

  visit(source)

  if (replacements.length === 0) {
    return false
  }

  replacements.sort((a, b) => b.start - a.start)
  let result = text

  for (const r of replacements) {
    result = result.slice(0, r.start) + r.rebuilt + result.slice(r.end)
  }

  if (needsParams) {
    result = addImport(result, 'Params')
  }

  if (needsSignal) {
    result = addImport(result, 'SignalParam')
  }

  fs.writeFileSync(filePath, result)
  return true
}

const files = walk(path.join(ROOT, 'packages'))
  .concat(walk(path.join(ROOT, 'internal')))
  .concat(walk(path.join(ROOT, '_examples')))
  .concat(walk(path.join(ROOT, '_benchmarks')))

let count = 0

for (const file of files) {
  try {
    if (migrateFile(file)) {
      count++
      console.log('updated', path.relative(ROOT, file))
    }
  } catch (e) {
    console.error('error', path.relative(ROOT, file), e.message)
  }
}

console.log(`migrated ${count} files`)

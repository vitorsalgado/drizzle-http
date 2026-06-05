#!/usr/bin/env node

import { createServer } from 'http'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const packageRoot = dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT) || 3000
const delayMs = Number(process.env.TIMEOUT) || 1
const payload = readFileSync(join(packageRoot, '..', 'data', 'data.json'))

createServer((_req, res) => {
  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(payload)
  }, delayMs)
})
  .listen(port)
  .on('listening', () => {
    console.error(`Benchmark server listening on http://localhost:${port}`)
  })
  .on('error', console.error)

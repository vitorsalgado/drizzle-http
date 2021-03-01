#!/usr/bin/env node

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { readFileSync } from 'fs'
import Path from 'path'

const port = process.env.PORT || 3000
const timeout = parseInt(process.env.TIMEOUT ?? '1', 10) || 1
const data = readFileSync(Path.resolve('benchmarks', 'data.json'))

createServer((_req: IncomingMessage, res: ServerResponse) => {
  setTimeout(function () {
    res.writeHead(200, 'OK', { 'Content-Type': 'application/json;charset=utf-8' })
    res.write(data, 'utf-8')
    res.end()
  }, timeout)
})
  .listen(port)
  .on('error', console.error)

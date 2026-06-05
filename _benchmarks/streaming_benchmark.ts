import type { Dispatcher } from 'undici'
import { group, run, summary } from 'mitata'
import { parallelRequests } from './config.js'
import { createBenchContext, jsonHeaders, resolveTarget } from './setup.js'
import { concurrentBench, createDiscardWritable } from './utils.js'

const target = resolveTarget()
const { api, pool } = createBenchContext(target)

const undiciOptions = {
  path: '/',
  method: 'GET' as Dispatcher.HttpMethod,
  headers: jsonHeaders,
  headersTimeout: 0,
  bodyTimeout: 0
} as const

group('streaming', () => {
  summary(() => {
    concurrentBench('drizzle-http - (undici) - (stream)', parallelRequests, () =>
      api.streaming(createDiscardWritable())
    )

    concurrentBench('undici - (stream)', parallelRequests, () =>
      pool.stream(undiciOptions, () => createDiscardWritable())
    )
  })
})

await run({ throw: true })

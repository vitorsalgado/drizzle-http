import { Writable } from 'stream'
import http from 'http'
import axiosImport from 'axios'
import type { AxiosStatic } from 'axios'
import got from 'got'
import { group, run, summary } from 'mitata'
import { parallelRequests } from './config.js'
import { benchBody, benchPath, benchUrl, createBenchContext, jsonHeaders, resolveTarget } from './setup.js'
import { concurrentBench } from './utils.js'

const axios = axiosImport as unknown as AxiosStatic

const target = resolveTarget()
const url = benchUrl(target)
const { httpAgent, api, pool } = createBenchContext(target)

const httpOptions = {
  method: 'POST',
  protocol: 'http:',
  hostname: 'localhost',
  agent: httpAgent,
  port: target.port,
  path: benchPath,
  headers: jsonHeaders
} as const

group('POST', () => {
  summary(() => {
    concurrentBench('drizzle-http - (undici)', parallelRequests, () =>
      api.post('identifier', 'some filter parameter', benchBody)
    )

    concurrentBench('drizzle-http - (undici) - (circuit breaker)', parallelRequests, () =>
      api.postCb('identifier', 'some filter parameter', benchBody)
    )

    concurrentBench('undici', parallelRequests, () =>
      pool
        .request({
          path: benchPath,
          body: JSON.stringify(benchBody),
          method: 'POST',
          headers: jsonHeaders
        })
        .then(({ body }) => body.json())
    )

    concurrentBench(
      'http',
      parallelRequests,
      () =>
        new Promise((resolve, reject) => {
          const chunks: Buffer[] = []
          const req = http.request(target.url, httpOptions, res => {
            res
              .pipe(
                new Writable({
                  write(chunk, _encoding, callback) {
                    chunks.push(chunk)
                    callback()
                  }
                })
              )
              .on('finish', () => resolve(JSON.parse(Buffer.concat(chunks).toString())))
              .on('error', reject)
          })

          req.on('error', reject)
          req.write(JSON.stringify(benchBody))
          req.end()
        })
    )

    concurrentBench('axios', parallelRequests, () =>
      axios.post(url, benchBody, {
        headers: jsonHeaders,
        httpAgent,
        responseType: 'json'
      })
    )

    concurrentBench('got', parallelRequests, () =>
      got
        .post(url, {
          agent: { http: httpAgent },
          headers: jsonHeaders,
          json: benchBody,
          retry: { limit: 0 }
        })
        .json<{ id: string; name: string; context: string }[]>()
    )
  })
})

await run({ throw: true })

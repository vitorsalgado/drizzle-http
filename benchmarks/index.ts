import { Dispatcher, Pool } from 'undici'
import { Writable } from 'stream'
import http from 'http'
import Axios from 'axios'
import got from 'got'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { DrizzleBuilder } from '@drizzle-http/core'
import { TestAPI } from './TestAPI.js'
import cronometro from 'cronometro'
import { Results } from 'cronometro'
import { table } from 'table'
import { CircuitBreakerCallAdapterFactory } from '@drizzle-http/opossum-circuit-breaker'

const iterations = (parseInt(process.env.SAMPLES as string, 10) || 100) + 1
const errorThreshold = parseInt(process.env.ERROR_TRESHOLD as string, 10) || 3
const connections = parseInt(process.env.CONNECTIONS as string, 10) || 50
const parallelRequests = parseInt(process.env.PARALLEL as string, 10) || 100
const pipelining = parseInt(process.env.PIPELINING as string, 10) || 10
const target: any = {}

if (process.env.PORT) {
  target.port = process.env.PORT
  target.url = `http://localhost:${process.env.PORT}/`
} else {
  target.port = '3000'
  target.url = 'http://localhost:3000/'
}

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: connections
})
const axiosAgent = new http.Agent({
  keepAlive: true,
  maxSockets: connections
})
const nodeFetchAgent = new http.Agent({
  keepAlive: true,
  maxSockets: connections
})

const httpOptions = {
  method: 'POST',
  protocol: 'http:',
  hostname: 'localhost',
  agent: httpAgent,
  port: target.port
}

const undiciOptions = {
  path: '/',
  method: 'GET' as Dispatcher.HttpMethod,
  headers: { 'Content-Type': 'application/json' },
  headersTimeout: 0,
  bodyTimeout: 0
}

const options = {
  pipelining,
  connections,
  ...target
}
const pool = new Pool(target.url, options)

const gotOpts = {
  agent: { http: httpAgent },
  retry: 0
}

const h = { 'Content-Type': 'application/json' }
// const headers = new Headers(h)
const drizzle = DrizzleBuilder.newBuilder()
  .baseUrl(target.url)
  .callFactory(new UndiciCallFactory(options))
  .addCallAdapterFactories(
    new CircuitBreakerCallAdapterFactory({
      options: {
        timeout: false,
        cache: false
      }
    })
  )
  .build()
const api: TestAPI = drizzle.create(TestAPI)

const data = {
  id: 100,
  name: 'bench',
  context: 'benchmark-test',
  active: true
}

function makeParallelRequests(callback: any): Promise<unknown> {
  return Promise.all(Array.from(Array(parallelRequests)).map(() => new Promise(callback)))
}

function printResults(results: Results): unknown {
  let last: number

  const rows = Object.entries(results)
    .sort((a, b) => (!a[1].success ? -1 : b[1].mean - a[1].mean))
    .map(([name, result]) => {
      if (!result.success) {
        return [name, result.size, 'Errored', 'N/A', 'N/A']
      }

      const { size, mean, standardError } = result
      const relative = last !== 0 ? (last / mean - 1) * 100 : 0

      if (typeof last === 'undefined') {
        last = mean
      }

      return [
        name,
        size,
        `${((connections * 1e9) / mean).toFixed(2)} req/sec`,
        `± ${((standardError / mean) * 100).toFixed(2)} %`,
        relative > 0 ? `+ ${relative.toFixed(2)} %` : '-'
      ]
    })

  rows.unshift(['Tests', 'Samples', 'Result', 'Tolerance', 'Difference with slowest'])

  return table(rows, {
    columns: {
      0: {
        alignment: 'left'
      },
      1: {
        alignment: 'right'
      },
      2: {
        alignment: 'right'
      },
      3: {
        alignment: 'right'
      },
      4: {
        alignment: 'right'
      }
    },
    drawHorizontalLine: (index, size) => index > 0 && index < size,
    border: {
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinLeft: '|',
      joinRight: '|',
      joinJoin: '|'
    }
  })
}

cronometro(
  {
    'drizzle-http - (undici)'() {
      return makeParallelRequests((callback: any) =>
        api.post('identifier', 'some filter parameter', data).then(callback)
      )
    },

    'drizzle-http - (undici) - (circuit breaker)'() {
      return makeParallelRequests((callback: any) =>
        api.postCb('identifier', 'some filter parameter', data).then(callback)
      )
    },

    undici() {
      return makeParallelRequests((callback: any) =>
        pool
          .request({
            path: `/10002000?filter=${encodeURIComponent('some filter parameter')}`,
            body: JSON.stringify(data),
            method: 'POST',
            headers: h
          })
          .then(({ body }) => body.json())
          .then(callback)
      )
    },

    http() {
      return makeParallelRequests((callback: any) => {
        const d: Buffer[] = []
        const req = http.request(
          target.url,
          {
            ...httpOptions,
            path: `/10002000?filter=${encodeURIComponent('some filter parameter')}`,
            headers: h
          },
          res =>
            res
              .pipe(
                new Writable({
                  write(_chunk, _encoding, callback) {
                    d.push(_chunk)
                    callback()
                  }
                })
              )
              .on('finish', () => callback(JSON.parse(Buffer.concat(d).toString())))
        )

        req.write(JSON.stringify(data))
        req.end()
      })
    },

    axios() {
      return makeParallelRequests((callback: any) =>
        Axios.post(target.url, {
          headers: h,
          data,
          httpAgent: axiosAgent,
          responseType: 'json'
        }).then(callback)
      )
    },

    got() {
      return makeParallelRequests((callback: any) =>
        got
          .post(target.url, {
            ...gotOpts,
            headers: h,
            responseType: 'json',
            retry: {
              limit: 0
            }
          })
          .json<{ id: string; name: string; context: string }[]>()
          .then(callback)
      )
    }
  },
  {
    iterations,
    errorThreshold
  },
  (err, results) => {
    if (err) {
      throw err
    }

    console.log(printResults(results))
  }
)

// .add('node-fetch', {
//   defer: true,
//   fn: (deferred: any) => {
//     Promise.all(
//       Array.from(Array(parallelRequests)).map(() =>
//         NodeFetch(target.url, {
//           method: 'post',
//           headers,
//           body: JSON.stringify(data),
//           agent: nodeFetchAgent
//         } as any).then(res => res.json())
//       )
//     ).finally(() => deferred.resolve())
//   }
// })

// .add('drizzle-http - stream', {
//   defer: true,
//   fn: (deferred: any) => {
//     Promise.all(
//       Array.from(Array(parallelRequests)).map(() =>
//         api.streaming(
//           new Writable({
//             write(_chunk, _encoding, callback) {
//               callback()
//             }
//           })
//         )
//       )
//     ).finally(() => deferred.resolve())
//   }
// })
//
// .add('undici - stream', {
//   defer: true,
//   fn: (deferred: any) => {
//     Promise.all(
//       Array.from(Array(parallelRequests)).map(() =>
//         pool.stream(
//           undiciOptions,
//           () =>
//             new Writable({
//               write(_chunk, _encoding, callback) {
//                 callback()
//               }
//             })
//         )
//       )
//     ).finally(() => deferred.resolve())
//   }
// })

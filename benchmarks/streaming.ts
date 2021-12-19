import { Pool } from 'undici'
import { Dispatcher } from 'undici'
import { Writable } from 'stream'
import http from 'http'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { DrizzleBuilder } from '@drizzle-http/core'
import { TestAPI } from './TestAPI.js'
import cronometro from 'cronometro'
import { CircuitBreakerCallAdapterFactory } from '@drizzle-http/opossum-circuit-breaker'
import { errorThreshold } from './variables.js'
import { parallelRequests } from './variables.js'
import { pipelining } from './variables.js'
import { connections } from './variables.js'
import { iterations } from './variables.js'
import { makeParallelRequests } from './utils.js'
import { printResults } from './utils.js'

const target: any = {}

if (process.env.PORT) {
  target.port = process.env.PORT
  target.url = `http://localhost:${process.env.PORT}/`
} else {
  target.port = '3000'
  target.url = 'http://localhost:3000/'
}

new http.Agent({
  keepAlive: true,
  maxSockets: connections
})
new http.Agent({
  keepAlive: true,
  maxSockets: connections
})
new http.Agent({
  keepAlive: true,
  maxSockets: connections
})

const options = {
  pipelining,
  connections,
  ...target
}
const pool = new Pool(target.url, options)

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

const undiciOptions = {
  path: '/',
  method: 'GET' as Dispatcher.HttpMethod,
  headers: { 'Content-Type': 'application/json' },
  headersTimeout: 0,
  bodyTimeout: 0
}

cronometro(
  {
    'drizzle-http - (undici) - (stream)'() {
      return makeParallelRequests(parallelRequests, (callback: any) => {
        api
          .streaming(
            new Writable({
              write(chunk, _encoding, callback) {
                callback()
              }
            })
          )
          .finally(() => callback())
      })
    },

    'undici - (stream)'() {
      return makeParallelRequests(parallelRequests, (callback: any) => {
        pool
          .stream(
            undiciOptions,
            () =>
              new Writable({
                write(_chunk, _encoding, callback) {
                  callback()
                }
              })
          )
          .finally(() => callback())
      })
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

    console.log(printResults(connections, results))
  }
)

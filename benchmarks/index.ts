import { Pool } from 'undici'
import { Writable } from 'stream'
import http from 'http'
import Axios from 'axios'
import got from 'got'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { DrizzleBuilder } from '@drizzle-http/core'
import { TestAPI } from './TestAPI.js'
import cronometro from 'cronometro'
import { CircuitBreakerCallAdapterFactory } from '@drizzle-http/opossum-circuit-breaker'
import { printResults } from './utils.js'
import { makeParallelRequests } from './utils.js'
import { pipelining } from './variables.js'
import { parallelRequests } from './variables.js'
import { connections } from './variables.js'
import { errorThreshold } from './variables.js'
import { iterations } from './variables.js'

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
new http.Agent({
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

cronometro(
  {
    'drizzle-http - (undici)'() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        api.post('identifier', 'some filter parameter', data).then(callback)
      )
    },

    'drizzle-http - (undici) - (circuit breaker)'() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        api.postCb('identifier', 'some filter parameter', data).then(callback)
      )
    },

    undici() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
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
      return makeParallelRequests(parallelRequests, (callback: any) => {
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
      return makeParallelRequests(parallelRequests, (callback: any) =>
        Axios.post(target.url, {
          headers: h,
          data,
          httpAgent: axiosAgent,
          responseType: 'json'
        }).then(callback)
      )
    },

    got() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
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

    console.log(printResults(connections, results))
  }
)

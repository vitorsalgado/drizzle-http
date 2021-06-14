import { Pool } from 'undici'
import { Readable, Writable } from 'stream'
import http from 'http'
import Benchmark from 'benchmark'
import Axios from 'axios'
import NodeFetch from 'node-fetch'
import got from 'got'
import {
  Body,
  ContentType,
  DrizzleBuilder,
  FetchCallFactory,
  GET,
  Headers,
  initDrizzleHttp,
  KeepAlive,
  MediaTypes,
  Param,
  POST,
  Query,
  Response,
  Streaming,
  StreamTo,
  StreamToResult,
  theTypes,
  UndiciCallFactory
} from 'drizzle-http'

const suite = new Benchmark.Suite()

const connections = parseInt(process.env.CONNECTIONS ?? '', 10) || 50
const parallelRequests = parseInt(process.env.PARALLEL ?? '', 10) || 10
const pipelining = parseInt(process.env.PIPELINING ?? '', 10) || 10
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
  method: 'GET',
  protocol: 'http:',
  hostname: 'localhost',
  path: '/',
  agent: httpAgent,
  port: '3000',
  url: target.url
}

const undiciOptions = {
  path: '/',
  method: 'GET',
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

@ContentType(MediaTypes.APPLICATION_JSON_UTF8)
class API {
  @GET('/')
  getArgLess(): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @POST('/{id}')
  post(@Param('id') _id: string, @Query('filter') _filter: string, @Body() _data: any): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @GET('/')
  @Streaming()
  streaming(@StreamTo() target: Writable): Promise<StreamToResult> {
    return theTypes(Promise)
  }
}

@ContentType(MediaTypes.APPLICATION_JSON_UTF8)
class ApiFetch {
  @POST('/{id}')
  @KeepAlive(true)
  post(@Param('id') _id: string, @Query('filter') _filter: string, @Body() _data: any): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

const drizzle = DrizzleBuilder.newBuilder().baseUrl(target.url).callFactory(new UndiciCallFactory(options)).build()

const api: API = drizzle.create(API)
const apiFetch: ApiFetch = initDrizzleHttp()
  .callFactory(new FetchCallFactory({ agent: httpAgent }))
  .baseUrl(target.url)
  .build()
  .create(ApiFetch)

const data = {
  id: 100,
  name: 'bench',
  context: 'benchmark-test',
  active: true
}

suite

  .add('drizzle-http - undici', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(() =>
          api.post('identifier', 'some filter parameter', data).then((response: Response) => response.json())
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('drizzle-http - fetch', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(() =>
          apiFetch.post('identifier', 'some filter parameter', data).then((response: Response) => response.json())
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('undici - pool - request', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(
          () =>
            new Promise<void>(resolve => {
              const d: Buffer[] = []

              pool
                .request({
                  path: `/10002000?filter=${encodeURIComponent('some filter parameter')}`,
                  body: JSON.stringify(data),
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                })
                .then(({ body }) =>
                  body
                    .pipe(
                      new Writable({
                        write(_chunk, _encoding, callback) {
                          d.push(_chunk)
                          callback()
                        }
                      })
                    )
                    .on('finish', () => {
                      resolve(JSON.parse(Buffer.concat(d).toString()) as any)
                    })
                )
            })
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('http', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(
          () =>
            new Promise(resolve => {
              const d: Buffer[] = []
              http.get(httpOptions, res =>
                res
                  .pipe(
                    new Writable({
                      write(_chunk, _encoding, callback) {
                        d.push(_chunk)
                        callback()
                      }
                    })
                  )
                  .on('finish', () => {
                    resolve(JSON.parse(Buffer.concat(d).toString()) as any)
                  })
              )
            })
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('axios', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(() =>
          Axios.post(target.url, {
            headers: { 'Content-Type': 'application/json' },
            data,
            httpAgent: axiosAgent
          })
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('got', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(() =>
          got.post(target.url, {
            ...gotOpts,
            headers: { 'Content-Type': 'application/json' },
            responseType: 'json'
          })
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('node-fetch', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(() =>
          NodeFetch(target.url, {
            method: 'post',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
            agent: nodeFetchAgent
          } as any).then(res => res.json())
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('drizzle-http - stream', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(() =>
          api.streaming(
            new Writable({
              write(_chunk, _encoding, callback) {
                callback()
              }
            })
          )
        )
      ).then(() => deferred.resolve())
    }
  })

  .add('undici - stream', {
    defer: true,
    fn: (deferred: any) => {
      Promise.all(
        Array.from(Array(parallelRequests)).map(() =>
          pool.stream(
            undiciOptions,
            () =>
              new Writable({
                write(_chunk, _encoding, callback) {
                  callback()
                }
              })
          )
        )
      ).then(() => deferred.resolve())
    }
  })

  // @ts-ignore
  .on('cycle', ({ target }) => {
    target.hz *= parallelRequests
    console.log(String(target))
  })
  .on('complete', function () {
    // @ts-ignore
    const self = this

    console.log('')
    console.log('Fastest is: ' + self.filter('fastest').map('name'))
    console.log('Slowest is: ' + self.filter('slowest').map('name'))
  })

  .run({ async: true })

import { Writable } from 'stream'
import EventEmitter from 'events'
import { URL } from 'url'
import { closeTestServer, Ok, setupTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { ContentType } from '@drizzle-http/core'
import { Query } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { Timeout } from '@drizzle-http/core'
import { H } from '@drizzle-http/core'
import { DrizzleBuilder } from '@drizzle-http/core'
import { QueryName } from '@drizzle-http/core'
import { Q } from '@drizzle-http/core'
import { Abort } from '@drizzle-http/core'
import { HeaderMap } from '@drizzle-http/core'
import { Header } from '@drizzle-http/core'
import { GET } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { P } from '@drizzle-http/core'
import { AsJSON } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { Streaming, StreamTo, StreamToHttpError, UndiciCallFactory, UndiciOptionsBuilder } from '..'
import { HttpEmptyResponse } from '..'

const evtCls = new EventEmitter()
const evtMethod = new EventEmitter()

@Abort(evtCls)
@Timeout(2500, 2500)
class API {
  @GET('/{id}/projects')
  @FullResponse()
  execute(@Param('id') id: string): Promise<HttpResponse> {
    return noop(id)
  }

  @GET('/nowhere')
  @FullResponse()
  nowhere(): Promise<HttpResponse> {
    return noop()
  }

  @GET('/')
  @ContentType('application/json')
  @Streaming()
  streaming(@StreamTo() target: Writable): Promise<HttpEmptyResponse> {
    return noop(target)
  }

  @GET('/nowhere')
  @ContentType('application/json')
  @Streaming()
  streamingFromNowhere(@StreamTo() target: Writable): Promise<HttpEmptyResponse> {
    return noop(target)
  }

  @GET('/long-running')
  @FullResponse()
  longRunning(@Abort() cancel: EventEmitter): Promise<HttpResponse> {
    return noop(cancel)
  }

  @GET('/long-running')
  @Abort(evtMethod)
  @FullResponse()
  longRunningMethod(): Promise<HttpResponse> {
    return noop()
  }

  @GET('/long-running')
  @FullResponse()
  longRunningClass(): Promise<HttpResponse> {
    return noop()
  }

  @GET('/group/{id}/owner/{name}/projects')
  @HeaderMap({ 'x-id': '100' })
  @AsJSON()
  complete(
    @Param('id') id: string,
    @P('name') name: string,
    @Query('filter') filter: string[],
    @Q('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @H('code') code: number
  ): Promise<TestResult<TestId>> {
    return noop(id, name, filter, sort, prop, cache, code)
  }
}

describe('Undici Call', function () {
  let drizzle: Drizzle
  let address = ''
  let api: API

  beforeAll(async () => {
    setupTestServer(fastify => {
      fastify.get('/long-running', (req, res) => {
        setTimeout(() => res.status(200).send({ ok: true }), 5000)
      })
      fastify.get('/testing/join/base/path', (req, res) => {
        res.status(200).send({ ok: true })
      })
    })

    await startTestServer().then((addr: string) => {
      address = addr
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(
          new UndiciCallFactory(
            UndiciOptionsBuilder.newBuilder()
              .connections(1)
              .headersTimeout(5000)
              .bodyTimeout(5000)
              .keepAliveTimeout(4e3)
              .keepAliveMaxTimeout(600e3)
              .keepAliveTimeoutThreshold(1e3)
              .pipelining(1)
              .maxHeaderSize(16384)
              .tls(null)
              .socketPath(null)
              .build()
          )
        )
        .addDefaultHeader('Content-Type', 'application/json')
        .build()
      api = drizzle.create(API)
    })
  })

  afterAll(() => Promise.all([closeTestServer(), drizzle.shutdown()]))

  it('should execute http call', function () {
    return api.execute('test').then(response => {
      expect(response.ok).toBeTruthy()
      expect(response.url.length).toBeGreaterThanOrEqual(1)
      expect(response.status).toEqual(200)
    })
  })

  it('should return error when request fails', function () {
    expect.assertions(1)

    return api.nowhere().then(response => {
      expect(response.status).toEqual(404)
    })
  })

  it('should fail if @Streaming() and @StreamTo() are not in sync', () => {
    expect(() => {
      class FailApi {
        @GET('/{id}/projects')
        @Streaming()
        invalidStreaming(@Param('id') id: string): Promise<HttpEmptyResponse> {
          return noop(id)
        }
      }

      DrizzleBuilder.newBuilder().build().create(FailApi)
    }).toThrowError()

    expect(() => {
      class FailApi {
        @GET('/{id}/projects')
        invalidStreaming(@Param('id') id: string, @StreamTo() to: unknown): Promise<HttpEmptyResponse> {
          return noop(id, to)
        }
      }

      DrizzleBuilder.newBuilder().build().create(FailApi)
    }).toThrowError()
  })

  it('should pipe the response direct to the writable stream', () => {
    return api
      .streaming(
        new Writable({
          write(_chunk, _encoding, callback) {
            callback()
          }
        })
      )
      .then(response => {
        expect(response.status).toEqual(200)
      })
  })

  it('should return error when stream to request fails', () => {
    expect.assertions(1)

    return api
      .streamingFromNowhere(
        new Writable({
          write(_chunk, _encoding, callback) {
            callback()
          }
        })
      )
      .catch((err: StreamToHttpError) => {
        expect(err.response.status).toEqual(404)
      })
  })

  it('should should send all specified arguments in the request respecting decorators setupTestServer', () => {
    const id = 'bbbcc31f-94ea-4b20-a184-644e8f3b5f15'
    const name = 'cool name'
    const filter = ['active', 'without debt']
    const prop = 'withProp(standard)'
    const sort = 'asc'
    const cache = true
    const code = 666

    return api.complete(id, name, filter, sort, prop, cache, code).then(response => {
      expect(response.result.id).toEqual(id)
      expect(response.query).toHaveProperty('filter', filter)
      expect(response.query).toHaveProperty('sort', sort)
      expect(response.query).toHaveProperty(prop)
      expect(response.params).toHaveProperty('id', id)
      expect(response.params).toHaveProperty('name', name)
      expect(response.headers).toHaveProperty('content-type', 'application/json')
      expect(response.headers).toHaveProperty('cache', String(cache))
      expect(response.headers).toHaveProperty('code', String(code))
      expect(response.url.substring(response.url.length - 1)).not.toEqual('&')
    })
  })

  it('should cancel the request when abort signal is sent', async () => {
    expect.assertions(2)

    const cancel = new EventEmitter()

    setTimeout(() => cancel.emit('abort', 1000))

    return api.longRunning(cancel).catch(err => {
      expect(err).not.toBeNull()
      expect(err.code).toEqual('UND_ERR_ABORTED')
    })
  })

  it('should cancel the request when send abort signal from method level event emitter', () => {
    expect.assertions(2)

    setTimeout(() => evtMethod.emit('abort', 1000))

    return api.longRunningMethod().catch(err => {
      expect(err).not.toBeNull()
      expect(err.code).toEqual('UND_ERR_ABORTED')
    })
  })

  it('should cancel the request when send abort signal from class level event emitter', () => {
    expect.assertions(2)

    setTimeout(() => evtCls.emit('abort', 1000))

    return api.longRunningClass().catch(err => {
      expect(err).not.toBeNull()
      expect(err.code).toEqual('UND_ERR_ABORTED')
    })
  })

  it('should join paths', async () => {
    class TestAPI {
      @GET('/base/path')
      @ContentType(MediaTypes.APPLICATION_JSON)
      exec(): Promise<Ok> {
        return noop()
      }
    }

    const testApi = DrizzleBuilder.newBuilder()
      .baseUrl(new URL('/testing/join', address).href)
      .callFactory(new UndiciCallFactory())
      .build()
      .create(TestAPI)

    const res = await testApi.exec()

    expect(res.ok).toBeTruthy()
  })

  it('should init stream result', function () {
    expect(
      () =>
        new HttpEmptyResponse('http://www.test.com.br/', {
          status: 200,
          statusText: '',
          headers: {},
          trailers: {},
          url: ''
        })
    ).not.toThrowError()
  })

  it('should call the registered shutdown hook', async () => {
    const drizzle = DrizzleBuilder.newBuilder()
      .baseUrl(new URL('/testing/join', address).href)
      .callFactory(new UndiciCallFactory())
      .build()

    await drizzle.shutdown()
  })
})

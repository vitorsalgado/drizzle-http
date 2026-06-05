import { Readable, Writable } from 'stream'
import EventEmitter from 'events'
import { URL } from 'url'
import { closeTestServer, Ok, setupTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import {
  Abort,
  ContentType,
  Drizzle,
  DrizzleBuilder,
  GET,
  Header,
  HeaderMap,
  HttpResponse,
  MediaTypes,
  noop,
  Param,
  Params,
  Retry,
  SignalParam,
  Query,
  QueryName,
  RawResponse,
  Timeout
} from '@drizzle-http/core'
import { Dispatcher } from 'undici'
import { UndiciCallFactory } from '../undici_call_factory.js'
import { PoolOptionsBuilder } from '../pool_options_builder.js'
import { Streaming } from '../streaming.js'
import { StreamTo } from '../stream_to.js'
import { StreamingResponse } from '../streaming_response.js'
import { UndiciResponse } from '../undici_response.js'

const evtCls = new EventEmitter()
const evtMethod = new EventEmitter()

@Abort(evtCls)
@Timeout(2500, 2500)
@ContentType(MediaTypes.APPLICATION_JSON)
class API {
  @GET('/{id}/projects')
  @RawResponse()
  @Params([Param('id')])
  execute(id: string): Promise<HttpResponse> {
    return noop(id)
  }

  @GET('/nowhere')
  @RawResponse()
  nowhere(): Promise<HttpResponse> {
    return noop()
  }

  @GET('/')
  @ContentType('application/json')
  @Streaming()
  @Params([StreamTo()])
  streaming(target: Writable): Promise<StreamingResponse> {
    return noop(target)
  }

  @GET('/nowhere')
  @ContentType('application/json')
  @Streaming()
  @Params([StreamTo()])
  streamingFromNowhere(target: Writable): Promise<StreamingResponse> {
    return noop(target)
  }

  @GET('/nowhere')
  @ContentType('application/json')
  @Streaming({ skipErrorBody: false })
  @Params([StreamTo()])
  streamingErrorBody(target: Writable): Promise<StreamingResponse> {
    return noop(target)
  }

  @GET('/slow-stream')
  @Streaming()
  @Params([StreamTo(), SignalParam()])
  slowStream(target: Writable, cancel: EventEmitter): Promise<StreamingResponse> {
    return noop(target, cancel)
  }

  @GET('/long-running')
  @RawResponse()
  @Params([SignalParam()])
  longRunning(cancel: EventEmitter): Promise<HttpResponse> {
    return noop(cancel)
  }

  @GET('/long-running')
  @Abort(evtMethod)
  @RawResponse()
  longRunningMethod(): Promise<HttpResponse> {
    return noop()
  }

  @GET('/long-running')
  @RawResponse()
  longRunningClass(): Promise<HttpResponse> {
    return noop()
  }

  @GET('/group/{id}/owner/{name}/projects')
  @HeaderMap({ 'x-id': '100' })
  @Params([Param('id'), Param('name'), Query('filter'), Query('sort'), QueryName(), Header('cache'), Header('code')])
  complete(
    id: string,
    name: string,
    filter: string[],
    sort: string,
    prop: string,
    cache: boolean,
    code: number
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
      fastify.get('/slow-stream', (req, reply) => {
        reply.hijack()
        reply.raw.writeHead(200, { 'content-type': 'application/octet-stream', 'transfer-encoding': 'chunked' })

        const interval = setInterval(() => {
          reply.raw.write('chunk-')
        }, 200)

        req.raw.on('close', () => {
          clearInterval(interval)
        })
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
            PoolOptionsBuilder.newBuilder()
              .connections(1)
              .headersTimeout(5000)
              .bodyTimeout(5000)
              .keepAliveTimeout(4e3)
              .keepAliveMaxTimeout(600e3)
              .keepAliveTimeoutThreshold(1e3)
              .pipelining(1)
              .maxHeaderSize(16384)
              .tls(undefined)
              .socketPath(undefined)
              .factory(undefined)
              .build()
          )
        )
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
        @Params([Param('id')])
        invalidStreaming(id: string): Promise<StreamingResponse> {
          return noop(id)
        }
      }

      DrizzleBuilder.newBuilder().baseUrl(address).callFactory(new UndiciCallFactory()).build().create(FailApi)
    }).toThrowError()

    expect(() => {
      class FailApi {
        @GET('/{id}/projects')
        @Params([Param('id'), StreamTo()])
        invalidStreaming(id: string, to: unknown): Promise<StreamingResponse> {
          return noop(id, to)
        }
      }

      DrizzleBuilder.newBuilder().baseUrl(address).callFactory(new UndiciCallFactory()).build().create(FailApi)
    }).toThrowError()
  })

  it('should resolve headers before completed and pipe body to writable', async () => {
    const chunks: string[] = []

    const target = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString())
        callback()
      }
    })

    const response = await api.streaming(target)

    expect(response.status).toEqual(200)
    expect(response.ok).toBeTruthy()

    await response.completed

    expect(chunks.join('')).toContain('result')
  })

  it('should not throw when an http error occurs and should skip error body by default', async () => {
    const chunks: string[] = []

    const response = await api.streamingFromNowhere(
      new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )

    expect(response.status).toEqual(404)
    expect(response.ok).toBeFalsy()

    await response.completed

    expect(chunks).toHaveLength(0)
  })

  it('should stream error body when skipErrorBody is false', async () => {
    const chunks: string[] = []

    const response = await api.streamingErrorBody(
      new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )

    expect(response.status).toEqual(404)

    await response.completed

    expect(chunks.length).toBeGreaterThan(0)
  })

  it('should reject completed when writable write throws', async () => {
    expect.assertions(2)

    const response = await api.streaming(
      new Writable({
        write(_chunk, _encoding) {
          throw new Error('Failed!')
        }
      })
    )

    expect(response.status).toEqual(200)

    await expect(response.completed).rejects.toThrow('Failed!')
  })

  it('should reject completed when streaming request is aborted after headers', async () => {
    expect.assertions(2)

    const cancel = new EventEmitter()

    setTimeout(() => cancel.emit('abort'), 300)

    const response = await api.slowStream(
      new Writable({
        write(_chunk, _encoding, callback) {
          callback()
        }
      }),
      cancel
    )

    expect(response.status).toEqual(200)

    await expect(response.completed).rejects.toMatchObject({ code: 'UND_ERR_ABORTED' })
  })

  it('should throw when @StreamTo() argument is not a Writable', async () => {
    expect.assertions(1)

    await expect(async () => {
      await api.streaming('not-a-stream' as unknown as Writable)
    }).rejects.toThrow('@StreamTo() argument must be a Writable stream.')
  })

  it('should fail on duplicate @StreamTo()', () => {
    expect(() => {
      class DupApi {
        @GET('/')
        @Streaming()
        @Params([StreamTo(), StreamTo()])
        dup(a: Writable, b: Writable): Promise<StreamingResponse> {
          return noop(a, b)
        }
      }

      DrizzleBuilder.newBuilder().baseUrl(address).callFactory(new UndiciCallFactory()).build().create(DupApi)
    }).toThrowError(/Only one parameter can be decorated with @StreamTo\(\)/)
  })

  it('should fail when @Streaming() is combined with @Retry()', () => {
    expect(() => {
      class RetryStreamApi {
        @GET('/')
        @Retry()
        @Streaming()
        @Params([StreamTo()])
        stream(target: Writable): Promise<StreamingResponse> {
          return noop(target)
        }
      }

      DrizzleBuilder.newBuilder().baseUrl(address).callFactory(new UndiciCallFactory()).build().create(RetryStreamApi)
    }).toThrowError(/@Streaming\(\) cannot be combined with @Retry\(\)/)
  })

  it('should invoke onHeaders before body is written', async () => {
    class OnHeadersApi {
      @GET('/')
      @Streaming({
        onHeaders: ({ statusCode, destination }) => {
          const writable = destination as Writable & { headerStatus?: number }
          writable.headerStatus = statusCode
          return destination
        }
      })
      @Params([StreamTo()])
      stream(target: Writable): Promise<StreamingResponse> {
        return noop(target)
      }
    }

    const onHeadersApi = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .build()
      .create(OnHeadersApi)

    const target = new Writable({
      write(_chunk, _encoding, callback) {
        callback()
      }
    }) as Writable & { headerStatus?: number }

    const response = await onHeadersApi.stream(target)

    expect(target.headerStatus).toEqual(200)
    expect(response.status).toEqual(200)

    await response.completed
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
    const completed = Promise.resolve({ trailers: new Headers() })

    expect(
      () =>
        new StreamingResponse(
          'http://www.test.com.br/',
          {
            status: 200,
            statusText: '',
            headers: {}
          },
          completed
        )
    ).not.toThrowError()
  })

  it('should call the registered shutdown hook', async () => {
    const drizzle = DrizzleBuilder.newBuilder()
      .baseUrl(new URL('/testing/join', address).href)
      .callFactory(new UndiciCallFactory())
      .build()

    await drizzle.shutdown()
  })

  it('should fail when decorated with @Streaming() and no parameters decorated with @StreamTo()', function () {
    class StApi {
      @GET('/')
      @Streaming()
      streaming(target: Writable): Promise<StreamingResponse> {
        return noop(target)
      }
    }

    const drizzle = DrizzleBuilder.newBuilder()
      .baseUrl('http://localhost:3000')
      .callFactory(new UndiciCallFactory())
      .build()

    expect(() => drizzle.create(StApi)).toThrowError()
  })

  it('should fail when one parameter is decorated with @StreamTo() and method is not decorated with @Streaming()', function () {
    class StApi {
      @GET('/')
      @Params([StreamTo()])
      streaming(target: Writable): Promise<StreamingResponse> {
        return noop(target)
      }
    }

    const drizzle = DrizzleBuilder.newBuilder()
      .baseUrl('http://localhost:3000')
      .callFactory(new UndiciCallFactory())
      .build()

    expect(() => drizzle.create(StApi)).toThrowError()
  })

  it('should expose pool from factory', async function () {
    const factory = new UndiciCallFactory()
    factory.setup(drizzle)

    expect(factory.pool()).toBeDefined()

    await factory.pool()?.close()
  })

  it('should init response when valid values are provided', async function () {
    expect.assertions(11)

    const res = await api.execute('test')

    const url = 'http://localhost:8080/test'
    const statusCode = 200
    const headers = { 'content-type': 'application/json' }
    const trailers = { 'content-length': '100' }

    const response = new UndiciResponse(url, {
      statusCode,
      headers,
      trailers,
      body: res.body as unknown as Readable & Dispatcher.BodyMixin,
      opaque: undefined,
      context: {}
    })

    const json = await response.json<{ result: { id: string } }>()
    const tr = await response.trailers
    const contentLength = tr.get('content-length')

    expect(response.status).toEqual(200)
    expect(contentLength).toEqual('100')
    expect(response.headers.get('content-type')).toEqual('application/json')
    expect(response.url).toEqual(url)
    expect(response.ok).toBeTruthy()
    expect(response.bodyUsed).toBeTruthy()
    expect(json.result).toEqual({ id: 'test' })

    try {
      await response.text()
    } catch (e) {
      expect(e).toBeDefined()
    }

    try {
      await response.arrayBuffer()
    } catch (e) {
      expect(e).toBeDefined()
    }

    try {
      await response.blob()
    } catch (e) {
      expect(e).toBeDefined()
    }

    try {
      await response.formData()
    } catch (e) {
      expect(e).toBeDefined()
    }
  })
})

import {
  Abort,
  AsJson,
  Cancellation,
  ContentType,
  Drizzle,
  DrizzleBuilder,
  GET,
  H,
  Header,
  HeaderMap,
  HttpError,
  MediaTypes,
  P,
  Param,
  Q,
  Query,
  QueryName,
  Response,
  theTypes,
  Timeout
} from '@drizzle-http/core'
import { UndiciCallFactory } from './factory'
import { closeTestServer, Ok, setupTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { Streaming, StreamTo, StreamToHttpError, StreamToResult } from './stream.call'
import { Writable } from 'stream'
import EventEmitter from 'events'
import { URL } from 'url'

const evtCls = new EventEmitter()
const evtMethod = new EventEmitter()

@Cancellation(evtCls)
@Timeout(10, 10)
class API {
  @GET('/{id}/projects')
  execute(@Param('id') id: string): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @GET('/nowhere')
  nowhere(): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @GET('/')
  @ContentType('application/json')
  @Streaming()
  streaming(@StreamTo() target: Writable): Promise<StreamToResult> {
    return theTypes(Promise, StreamToResult)
  }

  @GET('/nowhere')
  @ContentType('application/json')
  @Streaming()
  streamingFromNowhere(@StreamTo() target: Writable): Promise<StreamToResult> {
    return theTypes(Promise, StreamToResult)
  }

  @GET('/long-running')
  longRunning(@Abort() cancel: EventEmitter): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @GET('/long-running')
  @Abort(evtMethod)
  longRunningMethod(): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @GET('/long-running')
  longRunningClass(): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @GET('/group/{id}/owner/{name}/projects')
  @HeaderMap({ 'x-id': '100' })
  @AsJson()
  complete(
    @Param('id') id: string,
    @P('name') name: string,
    @Query('filter') filter: string[],
    @Q('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @H('code') code: number): Promise<TestResult<TestId>> {
    return theTypes(Promise, TestResult, id, name, filter, sort, prop, cache, code)
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
        .callFactory(UndiciCallFactory.DEFAULT)
        .addDefaultHeader('Content-Type', 'application/json')
        .build()
      api = drizzle.create(API)
    })
  })

  afterAll(() => Promise.all([closeTestServer(), drizzle.shutdown()]))

  it('should execute http call', function () {
    return api.execute('test')
      .then(response => {
        expect(response.ok).toBeTruthy()
        expect(response.url.length).toBeGreaterThanOrEqual(1)
        expect(response.status).toEqual(200)
      })
  })

  it('should return logErrorMsg when request fails', function () {
    expect.assertions(1)

    return api.nowhere()
      .catch((err: HttpError) => {
        expect(err.response.status).toEqual(404)
      })
  })

  it('should fail if @Streaming() and @StreamTo() are not in sync', () => {
    expect(() => {
      class FailApi {
        @GET('/{id}/projects')
        @Streaming()
        invalidStreaming(@Param('id') id: string): Promise<StreamToResult> {
          return theTypes(Promise, StreamToResult)
        }
      }

      DrizzleBuilder.newBuilder().build().create(FailApi)
    }).toThrowError()

    expect(() => {
      class FailApi {
        @GET('/{id}/projects')
        invalidStreaming(@Param('id') id: string, @StreamTo() to: any): Promise<StreamToResult> {
          return theTypes(Promise, StreamToResult)
        }
      }

      DrizzleBuilder.newBuilder().build().create(FailApi)
    }).toThrowError()
  })

  it('should pipe the response direct to the writable stream', () => {
    return api.streaming(
      new Writable({
        write(_chunk, _encoding, callback) {
          callback()
        }
      }))
      .then(response => {
        expect(response.status).toEqual(200)
        expect(response.stream).not.toBeNull()
        expect(response.stream).toBeInstanceOf(Writable)
        expect(response.stream).not.toBeUndefined()
      })
  })

  it('should return logErrorMsg when stream to request fails', () => {
    expect.assertions(1)

    return api.streamingFromNowhere(
      new Writable({
        write(_chunk, _encoding, callback) {
          callback()
        }
      }))
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

    return api.complete(id, name, filter, sort, prop, cache, code)
      .then(response => {
        expect(response.result.id).toEqual(id)
        expect(response.query).toHaveProperty('filter', filter)
        expect(response.query).toHaveProperty('sort', sort)
        expect(response.query).toHaveProperty(prop)
        expect(response.params).toHaveProperty('id', id)
        expect(response.params).toHaveProperty('name', name)
        expect(response.headers).toHaveProperty('content-type', 'application/json;charset=UTF-8')
        expect(response.headers).toHaveProperty('cache', String(cache))
        expect(response.headers).toHaveProperty('code', String(code))
        expect(response.url.substring(response.url.length - 1)).not.toEqual('&')
      })
  })

  it('should cancel the request when abort signal is sent', async () => {
    expect.assertions(2)

    const cancel = new EventEmitter()

    setTimeout(() => cancel.emit('abort', 1000))

    return api.longRunning(cancel)
      .catch(err => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual('UND_ERR_ABORTED')
      })
  })

  it('should cancel the request when send abort signal from method level event emitter', () => {
    expect.assertions(2)

    setTimeout(() => evtMethod.emit('abort', 1000))

    return api.longRunningMethod()
      .catch(err => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual('UND_ERR_ABORTED')
      })
  })

  it('should cancel the request when send abort signal from class level event emitter', () => {
    expect.assertions(2)

    setTimeout(() => evtCls.emit('abort', 1000))

    return api.longRunningClass()
      .catch(err => {
        expect(err).not.toBeNull()
        expect(err.code).toEqual('UND_ERR_ABORTED')
      })
  })

  it('should join paths', async () => {
    class TestAPI {
      @GET('/base/path')
      @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
      exec(): Promise<Ok> {
        return theTypes(Promise)
      }
    }

    const testApi = DrizzleBuilder.newBuilder()
      .baseUrl(new URL('/testing/join', address).href)
      .callFactory(UndiciCallFactory.DEFAULT)
      .build()
      .create(TestAPI)

    const res = await testApi.exec()

    expect(res.ok).toBeTruthy()
  })
})

import { closeTestServer, setupTestServer, startTestServer } from '@drizzle-http/test-utils'
import {
  AsJson,
  Body,
  ContentType,
  DrizzleBuilder,
  GET,
  HeaderMap,
  Param,
  POST,
  Response,
  theTypes
} from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { Level, Logger, LoggingInterceptor, PinoLogger } from './'
import { Readable } from 'stream'

describe('Logging Interceptor', function () {
  let address = ''

  function* txt() {
    yield 'start'
    yield '-'
    yield 'end'
  }

  class SpyLogger implements Logger {
    constructor(private readonly spy: jest.Mock<any, any>) {}

    error(message: string, error?: Error): void {
      this.spy(message, error)
    }

    info(message: string): void {
      this.spy(message)
    }
  }

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.post('/test-logging', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })
    })

    return startTestServer().then((addr: string) => {
      address = addr
    })
  })

  afterAll(() => closeTestServer())

  it('should log without errors with default implementation', () => {
    class API {
      @POST('/{id}/projects/{project}')
      @HeaderMap({ 'content-type': 'application/json; charset=UTF-8' })
      execute(@Param('id') id: string, @Param('project') project: string, @Body() body: any): Promise<Response> {
        return theTypes(Promise, Response)
      }
    }

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(UndiciCallFactory.DEFAULT)
      .addInterceptor(LoggingInterceptor.DEFAULT)
      .build()
      .create(API)

    return api.execute('test', 'proj', { name: 'test' })
  })

  it('should log without errors when logging headers and body', () => {
    class API2 {
      @POST('/{id}/projects/{project}')
      @HeaderMap({ 'content-type': 'application/json; charset=UTF-8' })
      execute(@Param('id') id: string, @Param('project') project: string, @Body() body: any): Promise<Response> {
        return theTypes(Promise, Response)
      }
    }

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(UndiciCallFactory.DEFAULT)
      .addInterceptor(new LoggingInterceptor(PinoLogger.DEFAULT, Level.BODY))
      .build()
      .create(API2)

    return api.execute('test', 'proj', { name: 'test' })
  })

  it('should log without errors when integration fails', () => {
    expect.assertions(1)

    class API3 {
      @GET('/nowhere')
      @HeaderMap({ 'content-type': 'application/json; charset=UTF-8' })
      execute(): Promise<Response> {
        return theTypes(Promise, Response)
      }
    }

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(UndiciCallFactory.DEFAULT)
      .addInterceptor(new LoggingInterceptor(PinoLogger.DEFAULT, Level.BODY))
      .build()
      .create(API3)

    return api.execute('test', 'proj', { name: 'test' }).catch((err: any) => expect(err.response.status).toEqual(404))
  })

  it('should not log redacted header value', () => {
    class API4 {
      @POST('/test-logging')
      @HeaderMap({
        'content-type': 'application/json; charset=UTF-8',
        'x-super-secret-header': 'super-secret-value',
        'x-hey': 'open-value'
      })
      execute(@Body() body: any): Promise<Response> {
        return theTypes(Promise, Response)
      }
    }

    class FakeLogger implements Logger {
      constructor(private readonly _spy: jest.Mock<any, any>) {}

      error(message: string, error?: Error): void {
        if (message.toLowerCase().indexOf('super-secret-value') > -1) {
          throw new Error('Logged forbidden value!')
        }

        this._spy(message, error)
      }

      info(message: string): void {
        if (message.toLowerCase().indexOf('super-secret-value') > -1) {
          throw new Error('Logged forbidden value!')
        }

        this._spy(message)
      }
    }

    const spy: jest.Mock = jest.fn()
    const fake = new FakeLogger(spy)

    const interceptor = new LoggingInterceptor(fake, Level.BODY)
    interceptor.redactHeader('x-super-secret-header')

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(UndiciCallFactory.DEFAULT)
      .addInterceptor(interceptor)
      .build()
      .create(API4)

    return api
      .execute({ name: 'test' })
      .then((response: Response) => {
        expect(response.status).toEqual(200)
        expect(response.ok).toBeTruthy()

        return response.json()
      })
      .then((res: any) => {
        expect(spy).toHaveBeenCalled()
        expect(res.test).toEqual('ok')
      })
  })

  it('should log without errors when body is a stream', () => {
    class API4 {
      @POST('/test-logging')
      @ContentType('text/plain')
      execute(@Body() body: any): Promise<Response> {
        return theTypes(Promise, Response)
      }
    }

    const spy: jest.Mock = jest.fn()
    const fake = new SpyLogger(spy)
    const interceptor = new LoggingInterceptor(fake, Level.BODY)

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(UndiciCallFactory.DEFAULT)
      .addInterceptor(interceptor)
      .build()
      .create(API4)

    return api.execute('test', 'proj', Readable.from(txt(), { objectMode: false }))
  })

  it('should fail when redact header with null or undefined name', function () {
    const interceptor = new LoggingInterceptor(PinoLogger.DEFAULT, Level.BODY)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => interceptor.redactHeader(null)).toThrowError()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => interceptor.redactHeader(undefined)).toThrowError()
  })

  it('should not log when level is NONE', () => {
    class API4 {
      @POST('/test-logging')
      @AsJson()
      execute(@Body() body: any): Promise<Response> {
        return theTypes(Promise, Response)
      }
    }

    const spy: jest.Mock = jest.fn()
    const fake = new SpyLogger(spy)

    const interceptor = new LoggingInterceptor(fake, Level.NONE)

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(UndiciCallFactory.DEFAULT)
      .addInterceptor(interceptor)
      .build()
      .create(API4)

    return api
      .execute({ name: 'test' })
      .then((response: Response) => {
        expect(response.status).toEqual(200)
        expect(response.ok).toBeTruthy()

        return response.json()
      })
      .then((res: any) => {
        expect(spy).not.toHaveBeenCalled()
        expect(res.test).toEqual('ok')
      })
  })
})

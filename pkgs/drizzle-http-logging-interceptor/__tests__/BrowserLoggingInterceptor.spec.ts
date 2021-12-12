import { Readable } from 'stream'
import { closeTestServer, setupTestServer, startTestServer } from '@drizzle-http/test-utils'
import { noop } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { HeaderMap } from '@drizzle-http/core'
import { ContentType } from '@drizzle-http/core'
import { Accept } from '@drizzle-http/core'
import { POST } from '@drizzle-http/core'
import { GET } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { AsJSON } from '@drizzle-http/core'
import { DrizzleBuilder } from '@drizzle-http/core'
import { HttpError } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { Body } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { BrowserLoggingInterceptor } from '../BrowserLoggingInterceptor'
import { Level } from '../Level'

describe('Browser Logging Interceptor', function () {
  let address = ''

  function* txt() {
    yield 'start'
    yield '-'
    yield 'end'
  }

  interface TestRes {
    test: string
  }

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.post('/test-logging', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })

      fastify.get('/get-logging', (req, res) => {
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
      @HeaderMap({ 'content-type': 'application/json' })
      execute(
        @Param('id') id: string,
        @Param('project') project: string,
        @Body() body: unknown
      ): Promise<HttpResponse> {
        return noop(id, project, body)
      }
    }

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addInterceptor(new BrowserLoggingInterceptor())
      .build()
      .create(API)

    return api.execute('test', 'proj', { name: 'test' })
  })

  it('should log without errors', () => {
    class API {
      @GET('/get-logging')
      @ContentType(MediaTypes.APPLICATION_JSON)
      @Accept(MediaTypes.APPLICATION_JSON)
      execute(): Promise<TestRes> {
        return noop()
      }
    }

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addInterceptor(new BrowserLoggingInterceptor({ level: Level.BODY }))
      .build()
      .create(API)

    return api.execute()
  })

  it('should log without errors when logging headers and body', () => {
    class API2 {
      @POST('/{id}/projects/{project}')
      @HeaderMap({ 'content-type': 'application/json' })
      @FullResponse()
      execute(
        @Param('id') id: string,
        @Param('project') project: string,
        @Body() body: unknown
      ): Promise<HttpResponse> {
        return noop(id, project, body)
      }
    }

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addInterceptor(new BrowserLoggingInterceptor({ level: Level.BODY }))
      .build()
      .create(API2)

    return api.execute('test', 'proj', { name: 'test' })
  })

  it('should log without errors when integration fails', () => {
    expect.assertions(1)

    class API3 {
      @GET('/nowhere')
      @HeaderMap({ 'content-type': 'application/json' })
      execute(): Promise<{ ok: string }> {
        return noop()
      }
    }

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addInterceptor(new BrowserLoggingInterceptor({ level: Level.BODY }))
      .build()
      .create(API3)

    return api.execute().catch((err: HttpError) => expect(err.response.status).toEqual(404))
  })

  it('should not log redacted header value', () => {
    class API4 {
      @POST('/test-logging')
      @HeaderMap({
        'content-type': 'application/json',
        'x-super-secret-header': 'super-secret-value',
        'x-hey': 'open-value'
      })
      @FullResponse()
      execute(@Body() body: unknown): Promise<HttpResponse> {
        return noop(body)
      }
    }

    const interceptor = new BrowserLoggingInterceptor({
      level: Level.BODY,
      headersToRedact: new Set<string>()
    })
    interceptor.redactHeader('x-super-secret-header')

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addInterceptor(interceptor)
      .build()
      .create(API4)

    return api
      .execute({ name: 'test' })
      .then((response: HttpResponse) => {
        expect(response.status).toEqual(200)
        expect(response.ok).toBeTruthy()

        return response.json<TestRes>()
      })
      .then((res: TestRes) => {
        expect(res.test).toEqual('ok')
      })
  })

  it('should log without errors when body is a stream', () => {
    class API4 {
      @POST('/test-logging')
      @ContentType('text/plain')
      @FullResponse()
      execute(@Body() body: unknown): Promise<HttpResponse> {
        return noop(body)
      }
    }

    const interceptor = new BrowserLoggingInterceptor({ level: Level.BASIC })
    interceptor.setLevel(Level.BODY)

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addInterceptor(interceptor)
      .build()
      .create(API4)

    return api.execute(Readable.from(txt(), { objectMode: false }))
  })

  it('should fail when redact a header empty varargs', function () {
    const interceptor = new BrowserLoggingInterceptor({ level: Level.BODY })

    expect(() => interceptor.redactHeader()).toThrowError()
  })

  it('should not log when level is NONE', () => {
    class API4 {
      @POST('/test-logging')
      @AsJSON()
      @FullResponse()
      execute(@Body() body: unknown): Promise<HttpResponse> {
        return noop(body)
      }
    }

    const interceptor = new BrowserLoggingInterceptor({
      level: Level.BASIC,
      headersToRedact: new Set<string>()
    })

    interceptor.level = Level.NONE

    const api = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addInterceptor(interceptor)
      .build()
      .create(API4)

    return api
      .execute({ name: 'test' })
      .then((response: HttpResponse) => {
        expect(response.status).toEqual(200)
        expect(response.ok).toBeTruthy()

        return response.json<TestRes>()
      })
      .then((res: TestRes) => {
        expect(res.test).toEqual('ok')
      })
  })
})

import EventEmitter from 'events'
import { vi } from 'vitest'
import { TestId } from '@drizzle-http/test-utils'
import { closeTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { Ok } from '@drizzle-http/test-utils'
import { TestResult } from '@drizzle-http/test-utils'
import { Data } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { Timeout } from '../decorators/index.js'
import { Header } from '../decorators/index.js'
import { POST } from '../decorators/index.js'
import { PUT } from '../decorators/index.js'
import { Body } from '../decorators/index.js'
import { DELETE } from '../decorators/index.js'
import { Field } from '../decorators/index.js'
import { HEAD } from '../decorators/index.js'
import { Accept } from '../decorators/index.js'
import { ContentType } from '../decorators/index.js'
import { Query } from '../decorators/index.js'
import { OPTIONS } from '../decorators/index.js'
import { PATCH } from '../decorators/index.js'
import { QueryName } from '../decorators/index.js'
import { Abort } from '../decorators/index.js'
import { HeaderMap } from '../decorators/index.js'
import { FormUrlEncoded } from '../decorators/index.js'
import { GET } from '../decorators/index.js'
import { Param } from '../decorators/index.js'
import { Path } from '../decorators/index.js'
import { UseJsonConv } from '../decorators/index.js'
import { UsePlainTextConv } from '../decorators/index.js'
import { ParseErrorBody } from '../decorators/index.js'
import { MediaTypes } from '../MediaTypes.js'
import { noop } from '../noop.js'
import { RawResponse } from '../builtin/index.js'
import { HttpResponse } from '../HttpResponse.js'
import { DrizzleBuilder, newAPI } from '../DrizzleBuilder.js'
import { Drizzle } from '../Drizzle.js'
import { HttpError } from '../HttpError.js'
import { TestCallFactory } from './TestCallFactory.js'

const cancellation = new EventEmitter()
const cancellationInMethod = new EventEmitter()

@HeaderMap({ 'Global-Header': 'Global-Value' })
@Timeout(2500, 2500)
@Accept(MediaTypes.TEXT_PLAIN)
@Abort(cancellation)
@Path('')
@ParseErrorBody()
@UseJsonConv()
class TestAPI {
  // region GET

  @GET('/')
  @HeaderMap({ 'X-Env': 'Test' })
  @ContentType(MediaTypes.APPLICATION_JSON)
  testGET(): Promise<TestResult<Ok>> {
    return noop()
  }

  @GET('/txt')
  @ContentType(MediaTypes.TEXT_PLAIN)
  @RawResponse()
  txt(): Promise<HttpResponse> {
    return noop()
  }

  @GET('/group/{id}/owner/{name}/projects')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Timeout(5000, 5000)
  projects(
    @Param('id') id: string,
    @Param('name') name: string,
    @Query('filter') filter: string[],
    @Query('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @Header('code') code: number,
    @Abort() abort: EventEmitter
  ): Promise<TestResult<TestId>> {
    return noop(id, name, filter, sort, prop, cache, code, abort)
  }

  @GET('/{id}/projects')
  @Accept(MediaTypes.APPLICATION_JSON)
  @Abort(cancellationInMethod)
  @RawResponse()
  getRaw(@Param('id') id: string, @Query('sort') orderBy: string): Promise<HttpResponse> {
    return noop(id, orderBy)
  }

  // endregion

  // region POST

  @POST('/{id}/projects/{project}')
  @HeaderMap({ 'content-type': 'application/json; charset=UTF-8' })
  testPOST(@Param('id') id: string, @Param('project') project: string, @Body() data: Data): Promise<TestResult<Ok>> {
    return noop(id, project, data)
  }

  // endregion

  // region PUT

  @PUT('/test-put')
  @ContentType(MediaTypes.APPLICATION_JSON)
  testPUT(@Body() data: unknown): Promise<TestResult<Ok>> {
    return noop(data)
  }

  // endregion

  // region DELETE

  @DELETE('/delete/{id}')
  @RawResponse()
  testDELETE(@Param('id') id: string): Promise<HttpResponse> {
    return noop(id)
  }

  // endregion

  // region PATCH

  @PATCH('/patch/{id}')
  @RawResponse()
  testPATCH(@Param('id') id: string): Promise<HttpResponse> {
    return noop(id)
  }

  // endregion

  // region OPTIONS

  @OPTIONS('/options')
  @RawResponse()
  testOPTIONS(): Promise<HttpResponse> {
    return noop()
  }

  // endregion

  // region HEAD

  @HEAD('/head')
  @RawResponse()
  testHEAD(): Promise<HttpResponse> {
    return noop()
  }

  // endregion

  @GET('/not-found')
  notFound(): Promise<TestResult<Ok>> {
    return noop()
  }
}

describe('Drizzle Http', () => {
  let drizzle: Drizzle
  let address = ''
  let api: TestAPI

  const configurerSpy = vi.fn()

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.all('/test', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })

      fastify.get('/txt', (req, res) => {
        res.status(200).header('x-configurer', req.headers['x-configurer']).send('ok')
      })

      fastify.all('/empty', (req, res) => {
        res.status(204).send()
      })

      fastify.put('/test-put', (req, res) => {
        res.status(200).send({
          test: 'ok',
          type: 'put',
          data: req.body
        })
      })

      fastify.delete('/delete/:id', (req, res) => {
        res.status(204).send()
      })

      fastify.delete('/patch/:id', (req, res) => {
        res.status(204).send()
      })

      fastify.options('/options', (req, res) => {
        res.status(204).header('options', 'all').send()
      })

      fastify.head('/head', (req, res) => {
        res.status(204).header('head', 'none').send()
      })
    })

    return startTestServer().then((addr: string) => {
      address = addr

      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(TestCallFactory.INSTANCE)
        .configurer(builder => configurerSpy(builder))
        .build()

      api = drizzle.create(TestAPI)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  describe('General', function () {
    it('should call registered shutdown', async () => {
      const shutdownSpy = vi.fn()
      const d = newAPI().callFactory(TestCallFactory.INSTANCE).baseUrl('http://www.test.com.br').build()
      d.registerShutdownHook(async () => shutdownSpy())

      await d.shutdown()

      expect(shutdownSpy).toHaveBeenCalled()
    })

    it('should allow AsJSON() and @Accept() on class level', function () {
      expect.assertions(3)

      @ContentType(MediaTypes.APPLICATION_JSON)
      @UseJsonConv()
      @Accept(MediaTypes.APPLICATION_JSON)
      class JsonAPI {
        @GET('/')
        test(): Promise<TestResult<Ok>> {
          return noop()
        }
      }

      const d = newAPI().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()

      const api: JsonAPI = d.create(JsonAPI)

      return api
        .test()
        .then(res => {
          expect(res.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON)
          expect(res.headers).toHaveProperty('accept', MediaTypes.APPLICATION_JSON)
          expect(res.result.ok).toBeTruthy()
        })
        .finally(() => d.shutdown())
    })

    it('should allow @ContentType() on class level', function () {
      expect.assertions(2)

      @ContentType(MediaTypes.APPLICATION_JSON)
      @UseJsonConv()
      class TestContentTypeClazzLevelAPI {
        @GET('/')
        test(): Promise<TestResult<Ok>> {
          return noop()
        }
      }

      const d = newAPI().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()

      const api: TestContentTypeClazzLevelAPI = d.create(TestContentTypeClazzLevelAPI)

      return api
        .test()
        .then(res => {
          expect(res.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON)
          expect(res.result.ok).toBeTruthy()
        })
        .finally(() => d.shutdown())
    })

    it('should allow @FormUrlEncoded() on class level', function () {
      expect.assertions(1)

      @FormUrlEncoded()
      class FormAPI {
        @POST('/')
        @RawResponse()
        test(@Field('value') val: string): Promise<HttpResponse> {
          return noop(val)
        }
      }

      const d = newAPI().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()

      const api: FormAPI = d.create(FormAPI)

      return api
        .test('test')
        .then(res => {
          return res.json<TestResult<Ok>>()
        })
        .then(result => {
          expect(result.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_FORM_URL_ENCODED)
        })
        .finally(() => d.shutdown())
    })

    it('should contain to string tag symbol', function () {
      expect(drizzle[Symbol.toStringTag]).toEqual('Drizzle')
    })
  })

  describe('GET', function () {
    it('should GET / and parse JSON response', () => {
      expect.assertions(3)

      return api.testGET().then(res => {
        expect(res.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON)
        expect(res.headers).toHaveProperty('x-env', 'Test')
        expect(res.result.ok).toBeTruthy()
      })
    })

    it('should GET text body', function () {
      expect.assertions(3)

      return api
        .txt()
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.ok).toBeTruthy()

          return res.text()
        })
        .then(txt => expect(txt).toEqual('ok'))
    })

    it('should return raw http res when return type is response', () => {
      const id = 'test'
      const orderBy = 'desc'
      return api.getRaw(id, orderBy).then(res => {
        expect(res.ok).toBeTruthy()
        expect(res.status).toEqual(200)

        return res.json<TestResult<TestId>>().then(parsed => {
          expect(parsed.result.id).toEqual(id)
          expect(parsed.params.id).toEqual(id)
          expect(parsed.query).toHaveProperty('sort', orderBy)
        })
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
      const ee = new EventEmitter()

      return api.projects(id, name, filter, sort, prop, cache, code, ee).then(res => {
        expect(res.result.id).toEqual(id)
        expect(res.query).toHaveProperty('filter', filter)
        expect(res.query).toHaveProperty('sort', sort)
        expect(res.query).toHaveProperty(prop)
        expect(res.params).toHaveProperty('id', id)
        expect(res.params).toHaveProperty('name', name)
        expect(res.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON)
        expect(res.headers).toHaveProperty('cache', String(cache))
        expect(res.headers).toHaveProperty('code', String(code))
        expect(res.url.substring(res.url.length - 1)).not.toEqual('&')
      })
    })
  })

  describe('POST', function () {
    it('should post json body data', () => {
      const id = 'RE-281028190'
      const project = 'test-project-3780921'
      const body = {
        description: 'description is unnecessary',
        active: true,
        meta: {
          type: 'none',
          more: [100, 200]
        }
      }

      return api.testPOST(id, project, body).then(res => {
        expect(res.result.ok).toBeTruthy()
        expect(res.body).toEqual(body)
      })
    })
  })

  describe('PUT', function () {
    it('should PUT', function () {
      expect.assertions(1)

      return api.testPUT({ value: 'some-value' }).then(res => {
        expect(res).toEqual({
          test: 'ok',
          type: 'put',
          data: { value: 'some-value' }
        })
      })
    })
  })

  describe('DELETE', function () {
    it('should DELETE', function () {
      expect.assertions(2)

      return api.testDELETE('to-delete').then(res => {
        expect(res.status).toEqual(204)
        expect(res.ok).toBeTruthy()
      })
    })
  })

  describe('PATCH', function () {
    it('should PATCH', function () {
      expect.assertions(2)

      return api.testDELETE('patch-me').then(res => {
        expect(res.status).toEqual(204)
        expect(res.ok).toBeTruthy()
      })
    })
  })

  describe('OPTIONS', function () {
    it('should OPTIONS', function () {
      expect.assertions(3)

      return api.testOPTIONS().then(res => {
        expect(res.status).toEqual(204)
        expect(res.ok).toBeTruthy()
        expect(res.headers.get('options')).toEqual('all')
      })
    })
  })

  describe('HEAD', function () {
    it('should HEAD', function () {
      expect.assertions(3)

      return api.testHEAD().then(res => {
        expect(res.status).toEqual(204)
        expect(res.ok).toBeTruthy()
        expect(res.headers.get('head')).toEqual('none')
      })
    })
  })

  describe('Globals', function () {
    it('should execute configurator functions and apply configurations to the builder', function () {
      return api
        .txt()
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.ok).toBeTruthy()
          expect(configurerSpy).toHaveBeenCalledTimes(1)

          return res.text()
        })
        .then(txt => {
          expect(txt).toEqual('ok')
        })
    })
  })

  describe('when two instances of same API class', function () {
    it('should create instance with parameters', async function () {
      const d = new DrizzleBuilder().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()
      const second = d.create(TestAPI)

      const res = await second.testGET()

      expect(res.headers['global-header']).toEqual('Global-Value')
      expect(res.headers.accept).toEqual(MediaTypes.TEXT_PLAIN)

      const original = await api.testGET()

      expect(original.headers['global-header']).toEqual('Global-Value')
      expect(original.headers.accept).toEqual(MediaTypes.TEXT_PLAIN)

      expect(original.headers.size).toEqual(res.headers.size)

      await d.shutdown()
    })
  })

  describe('when using an api instance from and abstract class', function () {
    it('should be able to create api instances with abstract classes', async function () {
      @Accept(MediaTypes.TEXT_PLAIN)
      @ContentType(MediaTypes.TEXT_PLAIN)
      @UsePlainTextConv()
      abstract class AbstractApi {
        @GET('/txt')
        txt(): Promise<string> {
          return noop()
        }
      }

      const d = newAPI().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()
      const absApi = d.create(AbstractApi)
      const txt = await absApi.txt()

      expect(txt).toEqual('ok')
    })
  })

  describe('when an HTTP error occurs', function () {
    describe('and response handler is default and not using the raw response return', function () {
      it('should throw an HttpError with request and response information', function () {
        expect.assertions(1)

        return api.notFound().catch((err: HttpError) => {
          expect(err.response.status).toEqual(404)
        })
      })
    })
  })
})

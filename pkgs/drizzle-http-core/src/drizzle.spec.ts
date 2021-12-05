import EventEmitter from 'events'
import {
  closeTestServer,
  Data,
  Ok,
  setupTestServer,
  startTestServer,
  TestId,
  TestResult
} from '@drizzle-http/test-utils'
import { noop } from './noop'
import { TestCallFactory } from './internal/http/test'
import {
  Abort,
  Accept,
  AsJSON,
  Body,
  ContentType,
  DELETE,
  Drizzle,
  DrizzleBuilder,
  Field,
  FormUrlEncoded,
  GET,
  H,
  HEAD,
  Header,
  HeaderMap,
  initDrizzleHttp,
  MediaTypes,
  OPTIONS,
  P,
  Param,
  PATCH,
  Path,
  POST,
  PUT,
  Q,
  Query,
  QueryName,
  theTypes,
  Timeout
} from '.'
import { DzResponse } from '.'
import { FullResponse } from '.'

const cancellation = new EventEmitter()
const cancellationInMethod = new EventEmitter()

@HeaderMap({ 'Global-Header': 'Global-Value' })
@Timeout(2500, 2500)
@Accept(MediaTypes.TEXT_PLAIN)
@Abort(cancellation)
@Path('')
class API {
  // region GET

  @GET('/')
  @HeaderMap({ 'X-Env': 'Test' })
  @AsJSON()
  testGET(): Promise<TestResult<Ok>> {
    return theTypes(Promise, TestResult)
  }

  @GET('/txt')
  @ContentType(MediaTypes.TEXT_PLAIN_UTF8)
  txt(): Promise<DzResponse> {
    return noop()
  }

  @GET('/group/{id}/owner/{name}/projects')
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
  @Timeout(5000, 5000)
  projects(
    @Param('id') id: string,
    @P('name') name: string,
    @Query('filter') filter: string[],
    @Q('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @H('code') code: number,
    @Abort() abort: EventEmitter
  ): Promise<TestResult<TestId>> {
    return noop(id, name, filter, sort, prop, cache, code, abort)
  }

  @GET('/{id}/projects')
  @Accept(MediaTypes.APPLICATION_JSON_UTF8)
  @Abort(cancellationInMethod)
  getRaw(@Param('id') id: string, @Query('sort') orderBy: string): Promise<DzResponse> {
    return noop()
  }

  // endregion

  // region POST

  @POST('/{id}/projects/{project}')
  @HeaderMap({ 'content-type': 'application/json; charset=UTF-8' })
  testPOST(@Param('id') id: string, @Param('project') project: string, @Body() data: Data): Promise<TestResult<Ok>> {
    return theTypes(Promise, TestResult, id, project, data)
  }

  // endregion

  // region PUT

  @PUT('/test-put')
  @ContentType(MediaTypes.APPLICATION_JSON)
  testPUT(@Body() data: unknown): Promise<TestResult<Ok>> {
    return theTypes(Promise, TestResult)
  }

  // endregion

  // region DELETE

  @DELETE('/delete/{id}')
  testDELETE(@Param('id') id: string): Promise<DzResponse> {
    return noop()
  }

  // endregion

  // region PATCH

  @PATCH('/patch/{id}')
  testPATCH(@Param('id') id: string): Promise<DzResponse> {
    return noop(Promise, DzResponse)
  }

  // endregion

  // region OPTIONS

  @OPTIONS('/options')
  testOPTIONS(): Promise<DzResponse> {
    return noop(Promise, DzResponse)
  }

  // endregion

  // region HEAD

  @HEAD('/head')
  testHEAD(): Promise<DzResponse> {
    return noop(Promise, DzResponse)
  }

  // endregion
}

describe('Drizzle Http', () => {
  let drizzle: Drizzle
  let address = ''
  let api: API

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.all('/test', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })

      fastify.get('/txt', (req, res) => {
        res.status(200).send('ok')
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

      drizzle = DrizzleBuilder.newBuilder().baseUrl(addr).callFactory(TestCallFactory.INSTANCE).build()

      api = drizzle.create(API)
    })
  })

  afterAll(async () => {
    await Promise.all([closeTestServer(), drizzle.shutdown()])
  })

  describe('General', function () {
    it('should call registered shutdown', async () => {
      const shutdownSpy = jest.fn()
      const d = initDrizzleHttp().callFactory(TestCallFactory.INSTANCE).baseUrl('http://www.test.com.br').build()
      d.registerShutdownHook(async () => shutdownSpy())

      await d.shutdown()

      expect(shutdownSpy).toHaveBeenCalled()
    })

    it('should allow AsJSON() and @Accept() on class level', function () {
      expect.assertions(3)

      @AsJSON()
      @Accept(MediaTypes.APPLICATION_JSON)
      class InnerAPI {
        @GET('/')
        test(): Promise<TestResult<Ok>> {
          return theTypes(Promise, TestResult)
        }
      }

      const d = initDrizzleHttp().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()

      const api: InnerAPI = d.create(InnerAPI)

      return api
        .test()
        .then(DzResponse => {
          expect(DzResponse.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON_UTF8)
          expect(DzResponse.headers).toHaveProperty('accept', MediaTypes.APPLICATION_JSON)
          expect(DzResponse.result.ok).toBeTruthy()
        })
        .finally(() => d.shutdown())
    })

    it('should allow @ContentType() on class level', function () {
      expect.assertions(2)

      @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
      class InnerAPI {
        @GET('/')
        test(): Promise<TestResult<Ok>> {
          return theTypes(Promise, TestResult)
        }
      }

      const d = initDrizzleHttp().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()

      const api: InnerAPI = d.create(InnerAPI)

      return api
        .test()
        .then(DzResponse => {
          expect(DzResponse.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON_UTF8)
          expect(DzResponse.result.ok).toBeTruthy()
        })
        .finally(() => d.shutdown())
    })

    it('should allow @FormUrlEncoded() on class level', function () {
      expect.assertions(1)

      @FormUrlEncoded()
      class InnerAPI {
        @POST('/')
        @FullResponse()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        test(@Field('value') val: string): Promise<DzResponse> {}
      }

      const d = initDrizzleHttp().baseUrl(address).callFactory(TestCallFactory.INSTANCE).build()

      const api: InnerAPI = d.create(InnerAPI)

      return api
        .test('test')
        .then(DzResponse => {
          return DzResponse.json<TestResult<Ok>>()
        })
        .then(result => {
          expect(result.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8)
        })
        .finally(() => d.shutdown())
    })

    it('should contain to string tag symbol', function () {
      expect(drizzle[Symbol.toStringTag]).toEqual('Drizzle')
    })
  })

  describe('GET', function () {
    it('should GET / and parse JSON DzResponse', () => {
      expect.assertions(3)

      return api.testGET().then(DzResponse => {
        expect(DzResponse.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON_UTF8)
        expect(DzResponse.headers).toHaveProperty('x-env', 'Test')
        expect(DzResponse.result.ok).toBeTruthy()
      })
    })

    it('should GET text body', function () {
      expect.assertions(3)

      return api
        .txt()
        .then(DzResponse => {
          expect(DzResponse.status).toEqual(200)
          expect(DzResponse.ok).toBeTruthy()

          return DzResponse.text()
        })
        .then(txt => expect(txt).toEqual('ok'))
    })

    it('should return raw http DzResponse when return type is DzResponse', () => {
      const id = 'test'
      const orderBy = 'desc'
      return api.getRaw(id, orderBy).then(DzResponse => {
        expect(DzResponse.ok).toBeTruthy()
        expect(DzResponse.status).toEqual(200)

        return DzResponse.json<TestResult<TestId>>().then(parsed => {
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

      return api.projects(id, name, filter, sort, prop, cache, code, ee).then(DzResponse => {
        expect(DzResponse.result.id).toEqual(id)
        expect(DzResponse.query).toHaveProperty('filter', filter)
        expect(DzResponse.query).toHaveProperty('sort', sort)
        expect(DzResponse.query).toHaveProperty(prop)
        expect(DzResponse.params).toHaveProperty('id', id)
        expect(DzResponse.params).toHaveProperty('name', name)
        expect(DzResponse.headers).toHaveProperty('content-type', MediaTypes.APPLICATION_JSON_UTF8)
        expect(DzResponse.headers).toHaveProperty('cache', String(cache))
        expect(DzResponse.headers).toHaveProperty('code', String(code))
        expect(DzResponse.url.substring(DzResponse.url.length - 1)).not.toEqual('&')
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

      return api.testPOST(id, project, body).then(DzResponse => {
        expect(DzResponse.result.ok).toBeTruthy()
        expect(DzResponse.body).toEqual(body)
      })
    })
  })

  describe('PUT', function () {
    it('should PUT', function () {
      expect.assertions(1)

      return api.testPUT({ value: 'some-value' }).then(DzResponse => {
        expect(DzResponse).toEqual({
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

      return api.testDELETE('to-delete').then(DzResponse => {
        expect(DzResponse.status).toEqual(204)
        expect(DzResponse.ok).toBeTruthy()
      })
    })
  })

  describe('PATCH', function () {
    it('should PATCH', function () {
      expect.assertions(2)

      return api.testDELETE('patch-me').then(DzResponse => {
        expect(DzResponse.status).toEqual(204)
        expect(DzResponse.ok).toBeTruthy()
      })
    })
  })

  describe('OPTIONS', function () {
    it('should OPTIONS', function () {
      expect.assertions(3)

      return api.testOPTIONS().then(DzResponse => {
        expect(DzResponse.status).toEqual(204)
        expect(DzResponse.ok).toBeTruthy()
        expect(DzResponse.headers.get('options')).toEqual('all')
      })
    })
  })

  describe('HEAD', function () {
    it('should HEAD', function () {
      expect.assertions(3)

      return api.testHEAD().then(DzResponse => {
        expect(DzResponse.status).toEqual(204)
        expect(DzResponse.ok).toBeTruthy()
        expect(DzResponse.headers.get('head')).toEqual('none')
      })
    })
  })
})

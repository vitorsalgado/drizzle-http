import { closeTestServer, setupTestServer, startTestServer } from '@drizzle-http/test-utils'
import { RequestFactory } from '../../../../RequestFactory.js'
import { MediaTypes } from '../../../../MediaTypes.js'
import { DrizzleBuilder, newAPI } from '../../../../DrizzleBuilder.js'
import { Body, ContentType, POST, Params } from '../../../../decorators/index.js'
import { GET } from '../../../../decorators/index.js'
import { HttpResponse } from '../../../../HttpResponse.js'
import {
  RawRequestConverter,
  RawRequestConverterFactory,
  RawResponse,
  RawResponseConverter,
  RawResponseConverterFactory
} from '../index.js'
import { RawRequest } from '../index.js'
import { noop } from '../../../../noop.js'
import { HttpHeaders } from '../../../../HttpHeaders.js'
import { TestCallFactory } from '../../../../_tests/TestCallFactory.js'

class API {
  @POST('/raw-test')
  @ContentType(MediaTypes.TEXT_PLAIN)
  @RawResponse()
  @Params([Body()])
  test(data: string): Promise<HttpResponse> {
    return noop(data)
  }

  @GET('/nowhere')
  @ContentType(MediaTypes.TEXT_PLAIN)
  @RawResponse()
  nowhere(): Promise<HttpResponse> {
    return noop()
  }
}

describe('Raw Converter', function () {
  let address = ''
  let api: API

  const drizzle = DrizzleBuilder.newBuilder()
    .baseUrl('http://www.test.com.br')
    .callFactory(new TestCallFactory())
    .build()

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.post('/raw-test', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })

      fastify.get('/nowhere', (req, res) => {
        res.status(404).send({ message: 'Nothing Here!' })
      })
    })

    return startTestServer().then((addr: string) => {
      address = addr
      api = newAPI().callFactory(new TestCallFactory()).baseUrl(address).build().create(API)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  it('should return raw response converter when method contains @RawResponse() decorator', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)

    requestFactory.registerDecorator(RawResponse)
    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawResponseConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(RawResponseConverter)
  })

  it('should return null response converter when method does not contain @RawResponse() decorator', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawResponseConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })

  it('should return raw request converter', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)
    requestFactory.registerDecorator(RawRequest)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawRequestConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(RawRequestConverter)
  })

  it('should set full response when using @RawResponse() decorator', () => {
    expect.assertions(3)

    return api.test('text').then(response => {
      expect(response.ok).toBeTruthy()
      expect(response.status).toEqual(200)

      return response.text().then(txt => expect(txt).toContain('ok'))
    })
  })

  it('should not throw error when request fails', async () => {
    expect.assertions(3)

    const response = await api.nowhere()
    const json = await response.json<{ message: string }>()

    expect(response.ok).toBeFalsy()
    expect(response.status).toEqual(404)
    expect(json.message).toEqual('Nothing Here!')
  })
})

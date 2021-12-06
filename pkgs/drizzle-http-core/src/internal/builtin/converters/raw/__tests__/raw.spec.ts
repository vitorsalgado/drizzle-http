import { closeTestServer, setupTestServer, startTestServer } from '@drizzle-http/test-utils'
import { RequestFactory } from '../../../../../RequestFactory'
import MediaTypes from '../../../../../MediaTypes'
import { DrizzleBuilder, initDrizzleHttp } from '../../../../../DrizzleBuilder'
import { TestCallFactory } from '../../../../net/http/test'
import { Body, ContentType, POST } from '../../../../../decorators'
import { HttpResponse } from '../../../../../HttpResponse'
import {
  FullResponse,
  RawRequestConverter,
  RawRequestConverterFactory,
  RawResponseConverter,
  RawResponseConverterFactory
} from '..'
import { noop } from '../../../../../noop'
import { HttpHeaders } from '../../../../../HttpHeaders'

class API {
  @POST('/raw-test')
  @ContentType(MediaTypes.TEXT_PLAIN_UTF8)
  @FullResponse()
  test(@Body() data: string): Promise<HttpResponse> {
    return noop(data)
  }
}

describe('Raw Converter', function () {
  let address = ''

  const drizzle = DrizzleBuilder.newBuilder()
    .baseUrl('http://www.test.com.br')
    .callFactory(new TestCallFactory())
    .build()

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.post('/raw-test', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })
    })

    return startTestServer().then((addr: string) => {
      address = addr
    })
  })

  afterAll(() => closeTestServer())

  it('should return raw response converter when generic return type is Response', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
    requestFactory.returnIdentifier = 'raw'

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawResponseConverterFactory()
    const converter = factory.responseBodyConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(RawResponseConverter)
  })

  it('should return null response converter when generic return type is not Response', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawResponseConverterFactory()
    const converter = factory.responseBodyConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })

  it('should return raw request converter', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
    requestFactory.returnIdentifier = 'raw'

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawRequestConverterFactory()
    const converter = factory.requestConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(RawRequestConverter)
  })

  it('should set full response when using @FullResponse() decorator', () => {
    expect.assertions(3)

    const api: API = initDrizzleHttp().callFactory(new TestCallFactory()).baseUrl(address).build().create(API)

    return api.test('text').then(response => {
      expect(response.ok).toBeTruthy()
      expect(response.status).toEqual(200)

      return response.text().then(txt => expect(txt).toContain('ok'))
    })
  })
})

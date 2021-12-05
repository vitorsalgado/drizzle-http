import { closeTestServer, setupTestServer, startTestServer } from '@drizzle-http/test-utils'
import { RequestFactory } from '../../../../request.factory'
import CommonHeaders from '../../../../http.common.headers'
import MediaTypes from '../../../../http.media.types'
import { DrizzleBuilder, initDrizzleHttp } from '../../../../drizzle.builder'
import { TestCallFactory } from '../../../http/test'
import { Body, ContentType, POST } from '../../../../decorators'
import { DzResponse } from '../../../../DzResponse'
import {
  FullResponse,
  RawRequestConverter,
  RawRequestConverterFactory,
  RawResponseConverter,
  RawResponseConverterFactory
} from '.'

class API {
  @POST('/raw-test')
  @ContentType(MediaTypes.TEXT_PLAIN_UTF8)
  @FullResponse()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  test(@Body() data: string): Promise<DzResponse> {}
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
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
    requestFactory.returnType = Promise
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
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
    requestFactory.returnType = Promise

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
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
    requestFactory.returnType = Promise
    requestFactory.returnIdentifier = 'raw'

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawRequestConverterFactory()
    const converter = factory.requestConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(RawRequestConverter)
  })

  it('should set full response when using @FullResponse() decorator', () => {
    expect.assertions(2)

    const api: API = initDrizzleHttp().callFactory(new TestCallFactory()).baseUrl(address).build().create(API)

    return api.test('text').then(response => {
      expect(response.ok).toBeTruthy()
      expect(response.status).toEqual(200)
    })
  })
})

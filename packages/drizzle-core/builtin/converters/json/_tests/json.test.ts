import { MediaTypes } from '../../../../media_types.js'
import { RequestFactory } from '../../../../request_factory.js'
import { DrizzleBuilder } from '../../../../drizzle_builder.js'
import {
  JsonRequestConverter,
  JsonRequestConverterFactory,
  JsonResponseConverter,
  JsonResponseConverterFactory
} from '../index.js'
import { BodyParameter } from '../../../parameterhandlers/index.js'
import { CommonHeaders } from '../../../../headers.js'
import { TestCallFactory } from '../../../../_tests/test_call_factory.js'

describe('JSON Converter', function () {
  const drizzle = DrizzleBuilder.newBuilder()
    .baseUrl('http://www.test.com.br')
    .callFactory(new TestCallFactory())
    .build()

  it(`should return form request converter when request type is "json"`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonRequestConverterFactory()
    const converter = factory.provide(drizzle, 'json', requestFactory)

    expect(converter).toBeInstanceOf(JsonRequestConverter)
  })

  it(`should return null request converter when request type is not "json"`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
    requestFactory.addParameter(new BodyParameter(0))

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonRequestConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })

  it(`should return json response converter when response type is "json"`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonResponseConverterFactory()
    const converter = factory.provide(drizzle, 'json', requestFactory)

    expect(converter).toBeInstanceOf(JsonResponseConverter)
  })

  it(`should return null response converter when response type is not "json"`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
    requestFactory.addParameter(new BodyParameter(0))

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonResponseConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })
})

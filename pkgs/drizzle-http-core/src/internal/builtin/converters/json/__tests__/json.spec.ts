import MediaTypes from '../../../../../MediaTypes'
import { RequestFactory } from '../../../../../RequestFactory'
import { DrizzleBuilder } from '../../../../../DrizzleBuilder'
import {
  JsonRequestConverter,
  JsonRequestConverterFactory,
  JsonResponseConverter,
  JsonResponseConverterFactory
} from '..'
import { BodyParameter } from '../../../parameterhandlers'
import { HttpHeaders } from '../../../../../HttpHeaders'
import { TestCallFactory } from '../../../../../__tests__/TestCallFactory'

describe('JSON Converter', function () {
  const drizzle = DrizzleBuilder.newBuilder()
    .baseUrl('http://www.test.com.br')
    .callFactory(new TestCallFactory())
    .build()

  it(`should return form request converter when content contains ${MediaTypes.APPLICATION_JSON}`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonRequestConverterFactory()
    const converter = factory.requestConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(JsonRequestConverter)
  })

  it(`should return null request converter when content type does not match ${MediaTypes.APPLICATION_JSON}`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
    requestFactory.addParameter(new BodyParameter(0))

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonRequestConverterFactory()
    const converter = factory.requestConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })

  it(`should return form response converter when content contains ${MediaTypes.APPLICATION_JSON}`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonResponseConverterFactory()
    const converter = factory.responseBodyConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(JsonResponseConverter)
  })

  it(`should return null response converter when content type does not match ${MediaTypes.APPLICATION_JSON}`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
    requestFactory.addParameter(new BodyParameter(0))

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonResponseConverterFactory()
    const converter = factory.responseBodyConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })
})

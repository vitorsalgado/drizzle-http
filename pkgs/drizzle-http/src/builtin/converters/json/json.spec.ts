import MediaTypes from '../../../http.media.types'
import { RequestFactory } from '../../../request.factory'
import { BodyParameter } from '../../../request.parameters'
import { Drizzle } from '../../../drizzle'
import CommonHeaders from '../../../http.common.headers'
import {
  JsonRequestConverter,
  JsonRequestConverterFactory,
  JsonResponseConverter,
  JsonResponseConverterFactory
} from './index'

describe('JSON Converter', function () {
  const drizzle = Drizzle.builder().build()

  it(`should return form request converter when content contains ${MediaTypes.APPLICATION_JSON}`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)

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
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
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
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)

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
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
    requestFactory.addParameter(new BodyParameter(0))

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new JsonResponseConverterFactory()
    const converter = factory.responseBodyConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })
})

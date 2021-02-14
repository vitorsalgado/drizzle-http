import { Drizzle } from '../../../drizzle'
import { RequestFactory } from '../../../request.factory'
import CommonHeaders from '../../../http.common.headers'
import MediaTypes from '../../../http.media.types'
import { Response } from '../../../response'
import {
  RawRequestConverter,
  RawRequestConverterFactory,
  RawResponseConverter,
  RawResponseConverterFactory
} from './index'

describe('Raw Converter', function () {
  const drizzle = Drizzle.builder().build()

  it('should return raw response converter when generic return type is Response', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
    requestFactory.returnType = Promise
    requestFactory.returnGenericType = Response

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
    requestFactory.returnGenericType = Response

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new RawRequestConverterFactory()
    const converter = factory.requestConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(RawRequestConverter)
  })
})

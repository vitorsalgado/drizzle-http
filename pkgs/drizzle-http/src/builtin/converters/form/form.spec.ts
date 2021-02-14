import MediaTypes from '../../../http.media.types'
import { FormRequestConverter, FormRequestConverterFactory } from './index'
import { RequestFactory } from '../../../request.factory'
import { BodyParameter } from '../../../request.parameters'
import { Drizzle } from '../../../drizzle'
import CommonHeaders from '../../../http.common.headers'

describe('Form Converter', function () {
  it(`should return form request converter when content type contains ${MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8}`, function () {
    const drizzle = Drizzle.builder().build()

    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new FormRequestConverterFactory()
    const converter = factory.requestConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(FormRequestConverter)
  })

  it(`should return null when content type does not contains ${MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8}`, function () {
    const drizzle = Drizzle.builder().build()

    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
    requestFactory.addParameter(new BodyParameter(0))

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new FormRequestConverterFactory()
    const converter = factory.requestConverter(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })
})

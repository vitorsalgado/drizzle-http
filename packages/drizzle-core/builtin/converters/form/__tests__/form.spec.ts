import { MediaTypes } from '../../../../MediaTypes'
import { RequestFactory } from '../../../../RequestFactory'
import { DrizzleBuilder } from '../../../../DrizzleBuilder'
import { RequestParameterization } from '../../../../RequestParameterization'
import { FormRequestConverter, FormRequestConverterFactory } from '..'
import { BodyParameter } from '../../../parameterhandlers'
import { HttpHeaders } from '../../../../HttpHeaders'
import { TestCallFactory } from '../../../../__tests__/TestCallFactory'

describe('Form Converter', function () {
  const drizzle = DrizzleBuilder.newBuilder()
    .baseUrl('http://www.test.com.br')
    .callFactory(new TestCallFactory())
    .build()

  it(`should return form request converter when request type is "form-url-encoded"`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new FormRequestConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)

    expect(converter).toBeInstanceOf(FormRequestConverter)
  })

  it(`should return null when request type is not "form-url-encoded"`, function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)
    requestFactory.addParameter(new BodyParameter(0))

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new FormRequestConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)

    expect(converter).toBeNull()
  })

  it('should convert key/value object to form', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new FormRequestConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)
    const rv = new RequestParameterization([])
    const obj = {
      name: 'the name',
      description: 'some description',
      age: '32'
    }

    converter?.convert(requestFactory, rv, obj)

    expect(rv.body).toEqual('name=the+name&description=some+description&age=32')
  })

  it('should convert bi-dimensional array to form', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new FormRequestConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)
    const rv = new RequestParameterization([])
    const arr = [
      ['name', 'the name'],
      ['description', 'some description'],
      ['age', 32]
    ]

    converter?.convert(requestFactory, rv, arr)

    expect(rv.body).toEqual('name=the+name&description=some+description&age=32')
  })

  it('should fail when trying to convert to with non bi-dimensional array', function () {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'POST'
    requestFactory.path = '/test'
    requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)

    requestFactory.preProcessAndValidate(drizzle)

    const factory = new FormRequestConverterFactory()
    const converter = factory.provide(drizzle, 'test', requestFactory)
    const rv = new RequestParameterization([])
    const arr = ['test', 'some other value']

    expect(() => converter?.convert(requestFactory, rv, arr)).toThrowError()
  })
})

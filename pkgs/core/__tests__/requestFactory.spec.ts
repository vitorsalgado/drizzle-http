import EventEmitter from 'events'
import { NoParametersRequestBuilder, RequestFactory } from '../RequestFactory'
import { pathParameterRegex } from '../internal'
import { MediaTypes } from '../MediaTypes'
import { DrizzleBuilder } from '../DrizzleBuilder'
import { QueryNameParameter } from '../builtin'
import { QueryParameter } from '../builtin'
import { HeaderParameter } from '../builtin'
import { BodyParameter } from '../builtin'
import { PathParameter } from '../builtin'
import { FormParameter } from '../builtin'
import { ApiDefaults } from '../ApiParameterization'
import { NoDrizzleUserAgent } from '../decorators'
import { TestCallFactory } from './TestCallFactory'

describe('Request Factory', () => {
  const drizzle = DrizzleBuilder.newBuilder()
    .baseUrl('http://www.test.com.br')
    .callFactory(new TestCallFactory())
    .build()

  it('should init with default values', () => {
    const requestFactory = new RequestFactory()

    expect(requestFactory.method).toStrictEqual('')
    expect(requestFactory.httpMethod).toStrictEqual('')
    expect(requestFactory.path).toStrictEqual('')
    expect(requestFactory.argLen).toStrictEqual(0)
    expect(requestFactory.getPathParameters()).toStrictEqual([])
    expect(requestFactory.getQueryParameters()).toStrictEqual([])
    expect(requestFactory.getQueryNameParameters()).toStrictEqual([])
    expect(requestFactory.getHeaderParameters()).toStrictEqual([])
    expect(requestFactory.getFormParameters()).toStrictEqual([])
    expect(requestFactory.isFormUrlEncoded()).toBeFalsy()
    expect(requestFactory.bodyIndex).toStrictEqual(-1)
    expect(requestFactory.defaultHeaders.size).toStrictEqual(0)
    expect(requestFactory.readTimeout).toBeUndefined()
    expect(requestFactory.connectTimeout).toBeUndefined()
    expect(requestFactory.parameterHandlers).toHaveLength(0)
    expect(requestFactory.signal).toEqual(null)
    expect(requestFactory.allConfigs()).toStrictEqual(new Map<string, unknown>())
    expect(requestFactory.hasQuery()).toBeFalsy()
    expect(requestFactory.hasQueryNames()).toBeFalsy()
    expect(requestFactory.hasFormFields()).toBeFalsy()
    expect(requestFactory.hasPathParameters()).toBeFalsy()
    expect(requestFactory.containsDynamicParameters()).toBeFalsy()
  })

  it('should add configuration', () => {
    const requestFactory = new RequestFactory()
    const key = 'key'
    const value = 'value'

    requestFactory.addConfig(key, value)

    const cfg = requestFactory.getConfig(key)

    expect(cfg).toEqual(value)
    expect(requestFactory.hasConfig(key))
    expect(requestFactory.allConfigs().size).toEqual(1)
    expect(requestFactory.allConfigs().get(key)).toEqual(value)
  })

  it('should return a of copy the configuration map to avoid changes in the internal config map', () => {
    const requestFactory = new RequestFactory()
    const key = 'key'
    const value = 'value'

    requestFactory.addConfig(key, value)
    requestFactory.allConfigs().delete(key)

    const cfg = requestFactory.getConfig(key)

    expect(cfg).toEqual(value)
    expect(requestFactory.allConfigs().size).toEqual(1)
    expect(requestFactory.allConfigs().get(key)).toEqual(value)
  })

  it('should fill url with all provided values', () => {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'GET'
    requestFactory.path = '/groups/{id}/projects'
    requestFactory.addDefaultHeaders({
      'x-id': '100',
      'content-type': MediaTypes.APPLICATION_JSON
    })
    requestFactory.addParameter(new HeaderParameter('x-id', 2))
    requestFactory.addParameters(
      new PathParameter('id', pathParameterRegex('id'), 0),
      new PathParameter('version', pathParameterRegex('version'), 1)
    )
    requestFactory.addParameters(new QueryParameter('filter', 3), new QueryParameter('active', 4))
    requestFactory.addParameters(new QueryNameParameter(5), new QueryNameParameter(6))

    const instanceMeta = new ApiDefaults()
    instanceMeta.connectTimeout = 10
    instanceMeta.readTimeout = 5
    instanceMeta.headers.mergeObject({ 'x-client-id': '666' })
    instanceMeta.path = 'api/{version}'

    requestFactory.mergeWithApiDefaults(instanceMeta)
    requestFactory.preProcessAndValidate(drizzle)

    const requestBuilder = requestFactory.requestBuilder(drizzle)
    const request = requestBuilder.toRequest([
      50,
      '1.0',
      '8bc',
      ['all', 'completed'],
      true,
      'sendTo(boss)',
      'pages(10)'
    ])

    expect(request.url).toEqual(
      '/api/1.0/groups/50/projects?filter=all&filter=completed&active=true&sendTo%28boss%29&pages%2810%29'
    )
    expect(request.method).toEqual('GET')
    expect(request.bodyTimeout).toEqual(5)
    expect(request.headersTimeout).toEqual(10)
    expect(request.headers.get('x-id')).toEqual('100,8bc')
    expect(request.headers.get('x-client-id')).toEqual('666')
    expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_JSON)
  })

  describe('Invalid instances', () => {
    it('should fail if validate() is called before preProcess()', () => {
      expect(() => new RequestFactory().validate()).toThrowError()
    })

    it('should fail if preProcess() is called twice', () => {
      const requestFactory = new RequestFactory()

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.preProcess(drizzle)).toThrowError()
    })

    it('should fail when no function method reference is set', () => {
      const requestFactory = new RequestFactory()
      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail when there is a query parameter without key', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.addParameter(new QueryParameter('', 0))

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail when function method reference is not set', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail when there is a header parameter without key', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.addParameter(new HeaderParameter('', 0))

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail when there is a path parameter without key', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.addParameter(new PathParameter('', /t/g, 0))

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail when there is a form field parameter without key', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.addParameter(new FormParameter('', 0))

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail when url and RequestFactory path parameters does not contain the same quantity of unique keys', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test/{id}/name/{name}/another/{id}/testing/{project}'
      requestFactory.addParameters(
        new PathParameter('id', pathParameterRegex('id'), 0),
        new PathParameter('name', pathParameterRegex('name'), 1)
      )

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail when url and RequestFactory path parameters are not in sync', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test/{id}/name/{name}/another/{id}/testing/{project}'
      requestFactory.addParameters(
        new PathParameter('id', pathParameterRegex('id'), 0),
        new PathParameter('name', pathParameterRegex('name'), 1),
        new PathParameter('some', pathParameterRegex('some'), 1)
      )

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail if query string contains template parameters', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test/{id}/name/{name}?filter=all&sort={sort}'
      requestFactory.addParameters(
        new PathParameter('id', pathParameterRegex('id'), 0),
        new PathParameter('name', pathParameterRegex('name'), 1)
      )

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail if a non form-url-encoded request contains @Field() arguments', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test'
      requestFactory.addParameter(new FormParameter('name', 0))

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail if a form-url-encoded request contains both @Body() and @Field() decorators', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeaders({ 'content-type': MediaTypes.APPLICATION_FORM_URL_ENCODED })
      requestFactory.addParameter(new FormParameter('name', 0))
      requestFactory.addParameter(new BodyParameter(1))

      requestFactory.preProcess(drizzle)

      expect(() => requestFactory.validate()).toThrowError()
    })

    it('should fail a GET, HEAD or OPTIONS request contains an argument decorated with @Body()', () => {
      const rGet = new RequestFactory()
      rGet.method = 'example'
      rGet.httpMethod = 'GET'
      rGet.path = '/test'
      rGet.bodyIndex = 1

      rGet.preProcess(drizzle)

      expect(() => rGet.validate()).toThrowError()

      const rHead = new RequestFactory()
      rHead.method = 'example'
      rHead.httpMethod = 'HEAD'
      rHead.path = '/test'
      rHead.bodyIndex = 1

      rHead.preProcess(drizzle)

      expect(() => rHead.validate()).toThrowError()

      const rOptions = new RequestFactory()
      rOptions.method = 'example'
      rOptions.httpMethod = 'OPTIONS'
      rOptions.path = '/test'
      rOptions.bodyIndex = 1

      rOptions.preProcess(drizzle)

      expect(() => rOptions.validate()).toThrowError()

      const rPost = new RequestFactory()
      rPost.method = 'example'
      rPost.httpMethod = 'POST'
      rPost.path = '/test'
      rPost.bodyIndex = 1

      rPost.preProcess(drizzle)

      expect(() => rPost.validate()).not.toThrowError()

      const rPut = new RequestFactory()
      rPut.method = 'example'
      rPut.httpMethod = 'PUT'
      rPut.path = '/test'
      rPut.bodyIndex = 1

      rPut.preProcess(drizzle)

      expect(() => rPut.validate()).not.toThrowError()

      const rPatch = new RequestFactory()
      rPatch.method = 'example'
      rPatch.httpMethod = 'PATCH'
      rPatch.path = '/test'
      rPatch.bodyIndex = 1

      rPatch.preProcess(drizzle)

      expect(() => rPatch.validate()).not.toThrowError()
    })
  })

  describe('Valid instances', () => {
    it('should preProcess() and validate() without errors', () => {
      const requestFactory = new RequestFactory()

      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test/{id}'
      requestFactory.addDefaultHeader('x-id', '100')
      requestFactory.addParameter(new HeaderParameter('Content-Type', 0))
      requestFactory.addParameter(new QueryParameter('filter', 0))
      requestFactory.addParameter(new PathParameter('id', pathParameterRegex('id'), 0))
      requestFactory.addParameter(new QueryNameParameter(0))

      expect(() => requestFactory.preProcessAndValidate(drizzle)).not.toThrowError()
      expect(requestFactory.defaultHeaders.get('user-agent')).toEqual('Drizzle-HTTP')
    })

    it('should merge with values from ApiDefaults', () => {
      class TestEmitter extends EventEmitter {}

      const testEmitter = new TestEmitter()

      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test/{id}'
      requestFactory.addDefaultHeader('x-id', '100')
      requestFactory.addParameter(new HeaderParameter('Content-Type', 0))
      requestFactory.addParameter(new PathParameter('id', pathParameterRegex('id'), 0))
      requestFactory.addParameter(new PathParameter('version', pathParameterRegex('version'), 0))

      const instanceMeta = new ApiDefaults()
      instanceMeta.connectTimeout = 15
      instanceMeta.readTimeout = 25
      instanceMeta.headers.mergeObject({ 'x-trace-id': '200' })
      instanceMeta.path = 'another/path/{version}/'
      instanceMeta.signal = testEmitter

      requestFactory.mergeWithApiDefaults(instanceMeta)
      requestFactory.preProcessAndValidate(drizzle)

      expect(requestFactory.path).toEqual('/another/path/{version}/test/{id}')
      expect(requestFactory.connectTimeout).toEqual(15)
      expect(requestFactory.readTimeout).toEqual(25)
      expect(requestFactory.signal).toEqual(testEmitter)
      expect(requestFactory.defaultHeaders.toObject()).toStrictEqual({
        'x-id': '100',
        'x-trace-id': '200',
        'user-agent': 'Drizzle-HTTP'
      })
    })

    it('should not add drizzle user agent header when decorated with NoDrizzleUserAgent() decorator', function () {
      const requestFactory = new RequestFactory()

      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test/{id}'
      requestFactory.addDefaultHeader('x-id', '100')
      requestFactory.addParameter(new PathParameter('id', pathParameterRegex('id'), 0))
      requestFactory.registerDecorator(NoDrizzleUserAgent)

      requestFactory.preProcessAndValidate(drizzle)

      expect(requestFactory.defaultHeaders.get('user-agent')).toBeNull()
    })

    it('should return a light weight request builder when there is no dynamic parameter in the request', () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeader('x-id', '100')

      requestFactory.preProcessAndValidate(drizzle)

      const requestBuilder = requestFactory.requestBuilder(drizzle)
      const req1 = requestBuilder.toRequest([])
      const req2 = requestBuilder.toRequest([])

      expect(requestBuilder).toBeInstanceOf(NoParametersRequestBuilder)
      expect(req1).toStrictEqual(req2)
    })

    it('should accept path as a absolute url with path', () => {
      const d = DrizzleBuilder.newBuilder()
        .baseUrl('https://www.test.com.br/path/other-path')
        .callFactory(new TestCallFactory())
        .build()
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/last'

      requestFactory.preProcessAndValidate(d)

      expect(requestFactory.path).toEqual('/path/other-path/last')
    })

    it('should do nothing when merging with empty instance meta', function () {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/path'

      requestFactory.mergeWithApiDefaults(null)
      requestFactory.preProcessAndValidate(drizzle)
    })

    it('should set noResponseConverter to FALSE as the default for new instances', () => {
      const requestFactory = new RequestFactory()
      expect(requestFactory.noResponseConverter).toBeFalsy()
    })

    it('should set noResponseConverter to TRUE when calling ignoreResponseConverter without value', () => {
      const requestFactory = new RequestFactory()
      requestFactory.ignoreResponseConverter()
      expect(requestFactory.noResponseConverter).toBeTruthy()
    })
  })

  describe('utils', function () {
    it('should return true when default header is set', function () {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/path'

      expect(requestFactory.hasHeader('test')).toBeFalsy()
      expect(requestFactory.hasHeaderWithValue('test', 'value')).toBeFalsy()

      requestFactory.addDefaultHeader('test', 'value')

      expect(requestFactory.hasHeader('test')).toBeTruthy()
      expect(requestFactory.hasHeaderWithValue('test', 'value')).toBeTruthy()
    })
  })
})

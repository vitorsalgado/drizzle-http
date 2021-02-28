import { NoParametersRequestBuilder, RequestFactory } from './request.factory'
import { ApiInstanceMeta } from './drizzle.meta'
import { Readable } from 'stream'
import {
  BodyParameter,
  FormParameter,
  HeaderParameter,
  PathParameter,
  QueryNameParameter,
  QueryParameter
} from './request.parameters'
import { pathParameterRegex } from './internal'
import { MediaTypes } from './http.media.types'
import EventEmitter from 'events'
import { DrizzleBuilder } from './drizzle.builder'

describe('Request Factory', () => {
  const drizzle = DrizzleBuilder.newBuilder().baseUrl('http://www.test.com.br').build()

  it('should init with default values', () => {
    const requestFactory = new RequestFactory()

    expect(requestFactory.method).toStrictEqual('')
    expect(requestFactory.httpMethod).toStrictEqual('')
    expect(requestFactory.path).toStrictEqual('')
    expect(requestFactory.argLen).toStrictEqual(0)
    expect(requestFactory.argTypes).toEqual([])
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
    expect(requestFactory.returnType).toBeUndefined()
    expect(requestFactory.returnGenericType).toBeUndefined()
    expect(requestFactory.parameterHandlers).toHaveLength(0)
    expect(requestFactory.signal).toEqual(null)
    expect(requestFactory.allConfigs()).toStrictEqual(new Map<string, any>())
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

      expect(() => new RequestFactory().validate()).toThrowError()
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
        new PathParameter('name', pathParameterRegex('name'), 1))

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
        new PathParameter('some', pathParameterRegex('some'), 1))

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
        new PathParameter('name', pathParameterRegex('name'), 1))

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
      requestFactory.addDefaultHeaders({ 'content-type': MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8 })
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
    })

    it('should merge with values from ApiInstanceMeta', () => {
      class TestEmitter extends EventEmitter {
      }

      const testEmitter = new TestEmitter()

      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'GET'
      requestFactory.path = '/test/{id}'
      requestFactory.addDefaultHeader('x-id', '100')
      requestFactory.addParameter(new HeaderParameter('Content-Type', 0))
      requestFactory.addParameter(new PathParameter('id', pathParameterRegex('id'), 0))
      requestFactory.addParameter(new PathParameter('version', pathParameterRegex('version'), 0))

      const instanceMeta = new ApiInstanceMeta()
      instanceMeta.connectTimeout = 15
      instanceMeta.readTimeout = 25
      instanceMeta.addDefaultHeaders({ 'x-trace-id': '200' })
      instanceMeta.setPath('another/path/{version}/')
      instanceMeta.signal = testEmitter

      requestFactory.mergeWithInstanceMeta(instanceMeta)
      requestFactory.preProcessAndValidate(drizzle)

      expect(requestFactory.path).toEqual('/another/path/{version}/test/{id}')
      expect(requestFactory.connectTimeout).toEqual(15)
      expect(requestFactory.readTimeout).toEqual(25)
      expect(requestFactory.signal).toEqual(testEmitter)
      expect(requestFactory.defaultHeaders.toObject()).toStrictEqual({
        'x-id': '100',
        'x-trace-id': '200',
        'user-agent': 'Drizzle-Http'
      })
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
  })

  describe('application/x-www-form-urlencoded', () => {
    it('should get a valid form-url-encoded request with values from @Field() args', async () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeaders({ 'x-id': '100', 'Content-Type': MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8 })
      requestFactory.addParameters(new FormParameter('name', 0), new FormParameter('age', 1))

      requestFactory.preProcessAndValidate(drizzle)

      const requestBuilder = requestFactory.requestBuilder(drizzle)
      const request = requestBuilder.toRequest(['nice coder', 32])
      const body = await request.text()

      expect(request.url).toEqual('/test')
      expect(request.method).toEqual('POST')
      expect(request.bodyTimeout).toBeUndefined()
      expect(request.headersTimeout).toBeUndefined()
      expect(request.headers.get('x-id')).toEqual('100')
      expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8)
      expect(body).toStrictEqual('name=nice+coder&age=32')
    })

    it('should get a valid form-url-encoded request with values from @Body() string arg', async () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeaders({ 'x-id': '100', 'Content-Type': MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8 })
      requestFactory.addParameter(new BodyParameter(0))

      requestFactory.preProcessAndValidate(drizzle)

      const requestBuilder = requestFactory.requestBuilder(drizzle)
      const request = requestBuilder.toRequest(['name=nice+coder&age=32'])
      const body = await request.text()

      expect(request.url).toEqual('/test')
      expect(request.method).toEqual('POST')
      expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8)
      expect(body).toStrictEqual('name=nice+coder&age=32')
    })

    it('should get a valid form-url-encoded request with values from @Body() Readable', async () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeaders({ 'x-id': '100', 'Content-Type': MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8 })
      requestFactory.addParameter(new BodyParameter(0))

      requestFactory.preProcessAndValidate(drizzle)

      function * b() {
        yield 'name=nice+coder'
        yield '&'
        yield 'age=32'
      }

      const requestBuilder = requestFactory.requestBuilder(drizzle)
      const request = requestBuilder.toRequest([Readable.from(b())])
      const body = await request.text()

      expect(request.url).toEqual('/test')
      expect(request.method).toEqual('POST')
      expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8)
      expect(body).toStrictEqual('name=nice+coder&age=32')
    })
  })

  describe('JSON', () => {
    it('should get a valid json request with @Body() object', async () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeader('Content-Type', MediaTypes.APPLICATION_JSON_UTF8)
      requestFactory.addParameter(new BodyParameter(0))
      requestFactory.bodyIndex = 0

      requestFactory.preProcessAndValidate(drizzle)

      const obj = { test: 'ok', context: 'lib' }
      const requestBuilder = requestFactory.requestBuilder(drizzle)
      const request = requestBuilder.toRequest([obj])
      const body = await request.json()

      expect(request.url).toEqual('/test')
      expect(request.method).toEqual('POST')
      expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_JSON_UTF8)
      expect(body).toStrictEqual(obj)
    })

    it('should get a valid json request with @Body() string', async () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeader('Content-Type', MediaTypes.APPLICATION_JSON_UTF8)
      requestFactory.addParameter(new BodyParameter(0))

      requestFactory.preProcessAndValidate(drizzle)

      const obj = { test: 'ok', context: 'lib' }
      const str = JSON.stringify(obj)
      const requestBuilder = requestFactory.requestBuilder(drizzle)
      const request = requestBuilder.toRequest([str])
      const body = await request.json()

      expect(request.url).toEqual('/test')
      expect(request.method).toEqual('POST')
      expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_JSON_UTF8)
      expect(body).toStrictEqual(obj)
    })

    it('should get a valid json request with @Body() Readable', async () => {
      const requestFactory = new RequestFactory()
      requestFactory.method = 'example'
      requestFactory.httpMethod = 'POST'
      requestFactory.path = '/test'
      requestFactory.addDefaultHeader('Content-Type', MediaTypes.APPLICATION_JSON_UTF8)
      requestFactory.addParameter(new BodyParameter(0))

      requestFactory.preProcessAndValidate(drizzle)

      const obj = { test: 'ok', context: 'lib' }
      const str = JSON.stringify(obj)
      const requestBuilder = requestFactory.requestBuilder(drizzle)
      const request = requestBuilder.toRequest([Readable.from(str, { objectMode: false })])
      const body = await request.json()

      expect(request.url).toEqual('/test')
      expect(request.method).toEqual('POST')
      expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_JSON_UTF8)
      expect(body).toStrictEqual(obj)
    })
  })

  it('should fill url with all provided values', () => {
    const requestFactory = new RequestFactory()
    requestFactory.method = 'example'
    requestFactory.httpMethod = 'GET'
    requestFactory.path = '/groups/{id}/projects'
    requestFactory.addDefaultHeaders({ 'x-id': '100', 'content-type': MediaTypes.APPLICATION_JSON_UTF8 })
    requestFactory.addParameter(new HeaderParameter('x-id', 2))
    requestFactory.addParameters(
      new PathParameter('id', pathParameterRegex('id'), 0),
      new PathParameter('version', pathParameterRegex('version'), 1))
    requestFactory.addParameters(
      new QueryParameter('filter', 3),
      new QueryParameter('active', 4))
    requestFactory.addParameters(
      new QueryNameParameter(5),
      new QueryNameParameter(6))

    const instanceMeta = new ApiInstanceMeta()
    instanceMeta.connectTimeout = 10
    instanceMeta.readTimeout = 5
    instanceMeta.addDefaultHeaders({ 'x-client-id': '666' })
    instanceMeta.setPath('api/{version}')

    requestFactory.mergeWithInstanceMeta(instanceMeta)
    requestFactory.preProcessAndValidate(drizzle)

    const requestBuilder = requestFactory.requestBuilder(drizzle)
    const request = requestBuilder.toRequest([50, '1.0', '8bc', ['all', 'completed'], true, 'sendTo(boss)', 'pages(10)'])

    expect(request.url).toEqual('/api/1.0/groups/50/projects?filter=all&filter=completed&active=true&sendTo%28boss%29&pages%2810%29')
    expect(request.method).toEqual('GET')
    expect(request.bodyTimeout).toEqual(5)
    expect(request.headersTimeout).toEqual(10)
    expect(request.headers.get('x-id')).toEqual('100,8bc')
    expect(request.headers.get('x-client-id')).toEqual('666')
    expect(request.headers.get('content-type')).toEqual(MediaTypes.APPLICATION_JSON_UTF8)
  })
})

import { initDrizzleHttp } from '../DrizzleBuilder'
import { QueryNameParameterHandlerFactory } from '../builtin'
import { FormParameterHandlerFactory } from '../builtin'
import { QueryParameterHandlerFactory } from '../builtin'
import { BodyParameterHandlerFactory } from '../builtin'
import { PathParameterHandlerFactory } from '../builtin'
import { SignalParameterHandlerFactory } from '../builtin'
import { HeaderParameterHandlerFactory } from '../builtin'
import { RequestFactory } from '../RequestFactory'
import { TestCallFactory } from './TestCallFactory'

describe('Drizzle Builder', function () {
  it('should remove end back slash from url', function () {
    const builder = initDrizzleHttp()
    builder.baseUrl('http://www.test.com.br/')
    builder.callFactory(new TestCallFactory())

    const drizzle = builder.build()

    expect(drizzle.baseUrl()).toEqual('http://www.test.com.br')
  })

  it('should not allow set call adapters with empty array', function () {
    const builder = initDrizzleHttp()

    expect(() => builder.addCallAdapterFactories()).toThrowError()
  })

  it('should not allow set request converters with empty array', function () {
    const builder = initDrizzleHttp()

    expect(() => builder.addRequestConverterFactories()).toThrowError()
  })

  it('should not allow set response converters with empty array', function () {
    const builder = initDrizzleHttp()

    expect(() => builder.addResponseConverterFactories()).toThrowError()
  })

  it('should not allow set header with empty key', function () {
    const builder = initDrizzleHttp()

    expect(() => builder.addDefaultHeader('', 'some value')).toThrowError()
  })

  it('should allow header with empty value', function () {
    const builder = initDrizzleHttp()

    expect(() => builder.addDefaultHeader('some-key', '')).not.toThrowError()
  })

  it('should not allow base url null or undefined', function () {
    const builder = initDrizzleHttp()

    expect(() => builder.build()).toThrowError()
  })

  it('should not allow call factory null or undefined', function () {
    const builder = initDrizzleHttp()
    builder.baseUrl('http://www.test.com.br/')

    expect(() => builder.build()).toThrowError()
  })

  it('should not allow empty parameter handlers', function () {
    const builder = initDrizzleHttp()
    builder.baseUrl('http://www.test.com.br/')
    builder.useDefaults(false)

    expect(() => builder.build()).toThrowError()
  })

  it('should build with default values', function () {
    const builder = initDrizzleHttp()
    builder.baseUrl('http://www.test.com.br/')
    builder.callFactory(new TestCallFactory())

    const drizzle = builder.build()
    const parameterHandlerFactories = drizzle.parameterHandlerFactories()

    expect(drizzle.interceptors('test', new RequestFactory())).toHaveLength(0)
    expect(parameterHandlerFactories).toHaveLength(7)
    expect(parameterHandlerFactories.some(x => x instanceof QueryParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof FormParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof PathParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof QueryNameParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof BodyParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof HeaderParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof SignalParameterHandlerFactory)).toBeTruthy()
  })

  it('should set default drizzle-http user-agent header when builder .useDrizzleUserAgent() is called', function () {
    const builder = initDrizzleHttp()
    builder.baseUrl('http://www.test.com.br/')
    builder.callFactory(new TestCallFactory())
    builder.useDrizzleUserAgent()

    const drizzle = builder.build()

    expect(drizzle.headers().has('user-agent')).toBeTruthy()
    expect(drizzle.headers().get('user-agent')).toEqual('Drizzle-Http')
  })

  it('should set default drizzle-http user-agent by default', function () {
    const builder = initDrizzleHttp()
    builder.baseUrl('http://www.test.com.br/')
    builder.callFactory(new TestCallFactory())

    const drizzle = builder.build()

    expect(drizzle.headers().has('user-agent')).toBeTruthy()
  })

  it('should not set default drizzle-http user-agent when builder .useDrizzleUserAgent() is called with FALSE', function () {
    const builder = initDrizzleHttp()
    builder.baseUrl('http://www.test.com.br/')
    builder.callFactory(new TestCallFactory())
    builder.useDrizzleUserAgent(false)

    const drizzle = builder.build()

    expect(drizzle.headers().has('user-agent')).toBeFalsy()
  })

  it('should contain to string tag symbol', function () {
    expect(initDrizzleHttp()[Symbol.toStringTag]).toEqual('DrizzleBuilder')
  })
})

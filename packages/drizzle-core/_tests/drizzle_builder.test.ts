import { newAPI } from '../drizzle_builder.js'
import { QueryNameParameterHandlerFactory } from '../builtin/index.js'
import { FormParameterHandlerFactory } from '../builtin/index.js'
import { QueryParameterHandlerFactory } from '../builtin/index.js'
import { BodyParameterHandlerFactory } from '../builtin/index.js'
import { PathParameterHandlerFactory } from '../builtin/index.js'
import { SignalParameterHandlerFactory } from '../builtin/index.js'
import { HeaderParameterHandlerFactory } from '../builtin/index.js'
import { ModelArgumentParameterHandlerFactory } from '../builtin/index.js'
import { RequestFactory } from '../request_factory.js'
import { TestCallFactory } from './test_call_factory.js'

describe('Drizzle Builder', function () {
  it('should remove end back slash from url', function () {
    const builder = newAPI()
    builder.baseUrl('http://www.test.com.br/')
    builder.callFactory(new TestCallFactory())

    const drizzle = builder.build()

    expect(drizzle.baseUrl()).toEqual('http://www.test.com.br')
  })

  it('should not allow set call adapters with empty array', function () {
    const builder = newAPI()

    expect(() => builder.addCallAdapterFactories()).toThrowError()
  })

  it('should not allow set request converters with empty array', function () {
    const builder = newAPI()

    expect(() => builder.addRequestConverterFactories()).toThrowError()
  })

  it('should not allow set response converters with empty array', function () {
    const builder = newAPI()

    expect(() => builder.addResponseConverterFactories()).toThrowError()
  })

  it('should not allow base url null or undefined', function () {
    const builder = newAPI()

    expect(() => builder.build()).toThrowError()
  })

  it('should not allow call factory null or undefined', function () {
    const builder = newAPI()
    builder.baseUrl('http://www.test.com.br/')

    expect(() => builder.build()).toThrowError()
  })

  it('should not allow empty parameter handlers', function () {
    const builder = newAPI()
    builder.baseUrl('http://www.test.com.br/')
    builder.useDefaults(false)

    expect(() => builder.build()).toThrowError()
  })

  it('should build with default values', function () {
    const builder = newAPI()
    builder.baseUrl('http://www.test.com.br/')
    builder.callFactory(new TestCallFactory())

    const drizzle = builder.build()
    const parameterHandlerFactories = drizzle.parameterHandlerFactories()

    expect(drizzle.interceptors(new RequestFactory())).toHaveLength(0)
    expect(parameterHandlerFactories).toHaveLength(8)
    expect(parameterHandlerFactories.some(x => x instanceof QueryParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof FormParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof PathParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof QueryNameParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof BodyParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof HeaderParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof SignalParameterHandlerFactory)).toBeTruthy()
    expect(parameterHandlerFactories.some(x => x instanceof ModelArgumentParameterHandlerFactory)).toBeTruthy()
  })

  it('should contain to string tag symbol', function () {
    expect(newAPI()[Symbol.toStringTag]).toEqual('DrizzleBuilder')
  })
})

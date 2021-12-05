import { Drizzle } from './drizzle'
import { RequestConverterFactory } from './request.body.converter'
import {
  CallbackCallAdapterFactory,
  FormRequestConverterFactory,
  JsonRequestConverterFactory,
  JsonResponseConverterFactory,
  RawRequestConverterFactory,
  RawResponseConverterFactory
} from './internal'
import { DrizzleError } from './internal'
import { notNull } from './internal'
import { CallAdapterFactory } from './call.adapter'
import { ResponseConverterFactory } from './response.converter'
import { CallFactory } from './call'
import { Interceptor } from './interceptor'
import { Parameter, ParameterHandlerFactory } from './request.parameter.handler'
import {
  BodyParameterHandlerFactory,
  FormParameterHandlerFactory,
  HeaderParameterHandlerFactory,
  PathParameterHandlerFactory,
  QueryNameParameterHandlerFactory,
  QueryParameterHandlerFactory,
  SignalParameterHandlerFactory
} from './request.parameters'
import { DzHeaders } from './http.headers'

/**
 * Shortcut function to create new {@link DrizzleBuilder} instance
 */
export function initDrizzleHttp(): DrizzleBuilder {
  return DrizzleBuilder.newBuilder()
}

/**
 * Builds {@link Drizzle} instance
 * baseUrl is required to be called before calling build.
 */
export class DrizzleBuilder {
  private _baseURL!: string
  private readonly _headers: DzHeaders
  private _callFactory!: CallFactory
  private readonly _interceptors: Interceptor<unknown, unknown>[]
  private readonly _callAdapterFactories: CallAdapterFactory[]
  private readonly _parameterHandlerFactories: ParameterHandlerFactory<Parameter, unknown>[]
  private readonly _requestConverterFactories: RequestConverterFactory[]
  private readonly _responseConverterFactories: ResponseConverterFactory[]
  private _enableDrizzleUserAgent: boolean
  private _useDefaults: boolean

  constructor() {
    this._headers = new DzHeaders({})
    this._interceptors = []
    this._callAdapterFactories = []
    this._parameterHandlerFactories = []
    this._requestConverterFactories = []
    this._responseConverterFactories = []
    this._enableDrizzleUserAgent = true
    this._useDefaults = true
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  static newBuilder(): DrizzleBuilder {
    return new DrizzleBuilder()
  }

  /**
   * Set the api base URL
   *
   * @param url- base url for this instance
   * @returns Same {@link DrizzleBuilder} instance
   */
  baseUrl(url: string): this {
    notNull(url, 'Parameter "url" must not be null.')

    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1)
    }

    this._baseURL = url

    return this
  }

  /**
   * Set the factory for {@link Call}.
   *
   * @param factory - {@link CallFactory} instance
   * @returns Same {@link DrizzleBuilder} instance
   */
  callFactory(factory: CallFactory): this {
    notNull(factory, 'Parameter "factory" must not be null.')

    this._callFactory = factory

    return this
  }

  /**
   * Adds a {@link Interceptor} to the execution chain
   *
   * @param interceptors - {@link Interceptor} instance
   * @returns Same {@link DrizzleBuilder} instance
   */
  addInterceptor(...interceptors: Interceptor<unknown, unknown>[]): this {
    notNull(interceptors, 'Parameter "interceptor" must not be null.')

    if (interceptors.length === 0) {
      throw new DrizzleError('Parameter "interceptor" must not be empty.')
    }

    this._interceptors.push(...interceptors)

    return this
  }

  /**
   * Adds {@link CallAdapterFactory} for adapting method responses other than Promise<V>.
   * You can add multiple factories at once.
   * The order is relevant for the resolution of the adapter to the request.
   *
   * @param callAdapterFactory - {@link CallAdapterFactory} instance
   * @returns Same {@link DrizzleBuilder} instance
   */
  addCallAdapterFactories(...callAdapterFactory: CallAdapterFactory[]): this {
    notNull(callAdapterFactory, 'Parameter "callAdapterFactory" must not be null.')

    if (callAdapterFactory.length === 0) {
      throw new DrizzleError('Parameter "callAdapterFactory" must not be empty.')
    }

    this._callAdapterFactories.push(...callAdapterFactory)

    return this
  }

  /**
   * Add {@link ParameterHandlerFactory} to handle decorated method arguments.
   * You can add multiple factories.
   *
   * @param factory - {@link ParameterHandlerFactory} instance
   * @returns Same {@link DrizzleBuilder} instance
   */
  addParameterHandlerFactory(factory: ParameterHandlerFactory<Parameter, unknown>): this {
    notNull(factory, 'Parameter "factory" must not be null.')

    this._parameterHandlerFactories.push(factory)

    return this
  }

  /**
   * Adds {@link RequestConverterFactory} for converting request body to another type.
   * You can add multiple factories.
   *
   * @param requestConverterFactory - {@link RequestConverterFactory} instance
   * @returns Same {@link DrizzleBuilder} instance
   */
  addRequestConverterFactories(...requestConverterFactory: RequestConverterFactory[]): this {
    notNull(requestConverterFactory, 'Parameter "requestConverterFactory" must not be null.')

    if (requestConverterFactory.length === 0) {
      throw new DrizzleError('Parameter "requestConverterFactory" must not be empty.')
    }

    this._requestConverterFactories.push(...requestConverterFactory)

    return this
  }

  /**
   * Adds {@link ResponseConverterFactory} for converting response body to another type.
   * You can add multiple factories.
   *
   * @param responseConverterFactory - {@link ResponseConverterFactory}
   * @returns Same {@link DrizzleBuilder} instance
   */
  addResponseConverterFactories(...responseConverterFactory: ResponseConverterFactory[]): this {
    notNull(responseConverterFactory, 'Parameter "responseConverterFactory" must not be null.')

    if (responseConverterFactory.length === 0) {
      throw new DrizzleError('Parameter "responseConverterFactory" must not be empty.')
    }

    this._responseConverterFactories.push(...responseConverterFactory)

    return this
  }

  /**
   * Sets the default Content-Type for when don't specify one.
   * Set a Content-Type at method level to override this one.
   *
   * @param key - header key
   * @param value - header value
   * @returns Same {@link DrizzleBuilder} instance
   */
  addDefaultHeader(key: string, value: string): this {
    notNull(key, 'Parameters "key" must not be null')
    notNull(value, 'Parameters "value" must not be null. If you want a empty Header value, provide a empty string.')

    if (key.length === 0) {
      throw new DrizzleError('Parameter "key" must not be an empty string.')
    }

    this._headers.append(key, value)

    return this
  }

  /**
   * Enable/Disable Drizzle-Http default User-Agent
   *
   * @param enable - enable/disable - defaults to true
   * @returns Same {@link DrizzleBuilder} instance
   */
  useDrizzleUserAgent(enable = true): this {
    this._enableDrizzleUserAgent = enable
    return this
  }

  /**
   * Enable/Disable the use of builtin components
   * @param enable - enable/disable - defaults to true
   * @returns Same {@link DrizzleBuilder} instance
   */
  useDefaults(enable = true): this {
    this._useDefaults = enable
    return this
  }

  /**
   * Builds a new {@link Drizzle} instance using the configured values.
   */
  build(): Drizzle {
    if (this._useDefaults) {
      this.setDefaults()
    }

    notNull(this._baseURL, '"BaseUrl" must not be null or undefined.')
    notNull(this._callFactory, 'No "CallFactory" set. Use "callFactory()" method to set a "CallFactory" configuration.')

    if (this._parameterHandlerFactories.length === 0) {
      throw new Error(
        'No "Parameter Handler Factories" set. ' +
          'Use "parameterHandlerFactory()" method to add a "ParameterHandlerFactory" instance. ' +
          'You can use the default handlers by calling "useDefaults(true) (Will add other default components too."'
      )
    }

    if (this._enableDrizzleUserAgent) {
      this.addDefaultHeader('user-agent', 'Drizzle-Http')
    }

    return new Drizzle(
      this._baseURL,
      this._headers,
      this._callFactory,
      this._interceptors,
      new Set<CallAdapterFactory>(this._callAdapterFactories),
      this._parameterHandlerFactories,
      new Set<RequestConverterFactory>(this._requestConverterFactories),
      new Set<ResponseConverterFactory>(this._responseConverterFactories)
    )
  }

  private setDefaults(): void {
    this.addCallAdapterFactories(new CallbackCallAdapterFactory())

    this.addParameterHandlerFactory(QueryParameterHandlerFactory.INSTANCE)
    this.addParameterHandlerFactory(QueryNameParameterHandlerFactory.INSTANCE)
    this.addParameterHandlerFactory(PathParameterHandlerFactory.INSTANCE)
    this.addParameterHandlerFactory(HeaderParameterHandlerFactory.INSTANCE)
    this.addParameterHandlerFactory(FormParameterHandlerFactory.INSTANCE)
    this.addParameterHandlerFactory(BodyParameterHandlerFactory.INSTANCE)
    this.addParameterHandlerFactory(SignalParameterHandlerFactory.INSTANCE)

    this.addRequestConverterFactories(
      new JsonRequestConverterFactory(),
      new FormRequestConverterFactory(),
      new RawRequestConverterFactory()
    )

    this._responseConverterFactories.unshift(new RawResponseConverterFactory())
    this.addResponseConverterFactories(new JsonResponseConverterFactory())
  }
}

import { Drizzle } from './Drizzle'
import { notNull } from './internal'
import { notEmpty } from './internal'
import { JsonResponseConverterFactory } from './builtin'
import { BodyParameterHandlerFactory } from './builtin'
import { ParameterHandlerFactory } from './builtin'
import { HeaderParameterHandlerFactory } from './builtin'
import { RawRequestConverterFactory } from './builtin'
import { QueryNameParameterHandlerFactory } from './builtin'
import { RawResponseConverterFactory } from './builtin'
import { FormParameterHandlerFactory } from './builtin'
import { QueryParameterHandlerFactory } from './builtin'
import { JsonRequestConverterFactory } from './builtin'
import { CallbackCallAdapterFactory } from './builtin'
import { Parameter } from './builtin'
import { FormRequestConverterFactory } from './builtin'
import { PathParameterHandlerFactory } from './builtin'
import { SignalParameterHandlerFactory } from './builtin'
import { RawResponseHandlerFactory } from './builtin'
import { PlainTextResponseConverterFactory } from './builtin'
import { ModelArgumentParameterHandlerFactory } from './builtin'
import { RetryInterceptorFactory } from './builtin'
import { Interceptor } from './Interceptor'
import { InterceptorFactory } from './Interceptor'
import { InterceptorFunction } from './Interceptor'
import { RequestBodyConverterFactory } from './RequestBodyConverter'
import { CallAdapterFactory } from './CallAdapter'
import { CallFactory } from './Call'
import { ResponseConverterFactory } from './ResponseConverter'
import { ResponseHandlerFactory } from './ResponseHandler'

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
  private _callFactory!: CallFactory
  private readonly _interceptors: Interceptor[]
  private readonly _interceptorFactories: InterceptorFactory[]
  private readonly _callAdapterFactories: CallAdapterFactory[]
  private readonly _parameterHandlerFactories: ParameterHandlerFactory<Parameter, unknown>[]
  private readonly _requestConverterFactories: RequestBodyConverterFactory[]
  private readonly _responseConverterFactories: ResponseConverterFactory[]
  private readonly _responseHandlerFactories: ResponseHandlerFactory[]
  private _useDefaults: boolean

  constructor() {
    this._interceptors = []
    this._interceptorFactories = []
    this._callAdapterFactories = []
    this._parameterHandlerFactories = []
    this._requestConverterFactories = []
    this._responseConverterFactories = []
    this._responseHandlerFactories = []
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
   * @returns DrizzleBuilder
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
   * @returns DrizzleBuilder
   */
  callFactory(factory: CallFactory): this {
    notNull(factory, 'Parameter "factory" must not be null.')

    this._callFactory = factory

    return this
  }

  /**
   * Add one or more {@link ResponseHandlerFactory}
   *
   * @param factories - list of {@link ResponseHandlerFactory} to be added
   */
  addResponseHandlerFactory(...factories: ResponseHandlerFactory[]): this {
    notNull(factories)
    notEmpty(factories)

    this._responseHandlerFactories.push(...factories)

    return this
  }

  /**
   * Adds a {@link Interceptor} to the execution chain.
   * You can also provide a {@link InterceptorFactory} instance expose Drizzle core components during setup phase.
   *
   * @param interceptor - {@link Interceptor} instance or a {@link InterceptorFactory} instance
   * @returns DrizzleBuilder
   */
  addInterceptor(interceptor: Interceptor | InterceptorFunction | InterceptorFactory): this {
    notNull(interceptor, 'Parameter "interceptor" must not be null.')

    if (typeof interceptor === 'function') {
      this._interceptors.push({ intercept: interceptor })
    } else {
      if ('provide' in interceptor) {
        this._interceptorFactories.push(interceptor)
      } else if ('intercept' in interceptor) {
        this._interceptors.push(interceptor)
      }
    }

    return this
  }

  /**
   * Adds {@link CallAdapterFactory} for adapting method responses other than Promise<V>.
   * You can add multiple factories at once.
   * The order is relevant for the resolution of the adapter to the request.
   *
   * @param callAdapterFactory - {@link CallAdapterFactory} instance
   * @returns DrizzleBuilder
   */
  addCallAdapterFactories(...callAdapterFactory: CallAdapterFactory[]): this {
    notNull(callAdapterFactory, 'Parameter "callAdapterFactory" must not be null.')
    notEmpty(callAdapterFactory, 'Parameter "callAdapterFactory" must not be empty.')

    this._callAdapterFactories.push(...callAdapterFactory)

    return this
  }

  /**
   * Add {@link ParameterHandlerFactory} to handle decorated method arguments.
   * You can add multiple factories.
   *
   * @param factory - {@link ParameterHandlerFactory} instance
   * @returns DrizzleBuilder
   */
  addParameterHandlerFactory(factory: ParameterHandlerFactory<Parameter, unknown>): this {
    notNull(factory, 'Parameter "factory" must not be null.')

    this._parameterHandlerFactories.push(factory)

    return this
  }

  /**
   * Adds {@link RequestBodyConverterFactory} for converting request body to another type.
   * You can add multiple factories.
   *
   * @param requestConverterFactory - {@link RequestBodyConverterFactory} instance
   * @returns DrizzleBuilder
   */
  addRequestConverterFactories(...requestConverterFactory: RequestBodyConverterFactory[]): this {
    notNull(requestConverterFactory, 'Parameter "requestConverterFactory" must not be null.')
    notEmpty(requestConverterFactory, 'Parameter "requestConverterFactory" must not be empty.')

    this._requestConverterFactories.push(...requestConverterFactory)

    return this
  }

  /**
   * Adds {@link ResponseConverterFactory} for converting response body to another type.
   * You can add multiple factories.
   *
   * @param responseConverterFactory - {@link ResponseConverterFactory}
   * @returns DrizzleBuilder
   */
  addResponseConverterFactories(...responseConverterFactory: ResponseConverterFactory[]): this {
    notNull(responseConverterFactory, 'Parameter "responseConverterFactory" must not be null.')
    notEmpty(responseConverterFactory, 'Parameter "responseConverterFactory" must not be empty.')

    this._responseConverterFactories.push(...responseConverterFactory)

    return this
  }

  /**
   * Enable/Disable the use of builtin components
   * @param enable - enable/disable - defaults to true
   * @returns DrizzleBuilder
   */
  useDefaults(enable = true): this {
    this._useDefaults = enable
    return this
  }

  /**
   * Add a configurator function. With a configuration function its possible to apply several configurations at one time.
   * Good to configure several lib components in one call.
   *
   * @param configurators - configuration functions that receive the {@link DrizzleBuilder} instance as a parameter.
   */
  configurer(...configurators: ((drizzleBuilder: DrizzleBuilder) => void)[]): this {
    for (const configurer of configurators) {
      configurer(this)
    }

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
    notEmpty(
      this._parameterHandlerFactories,
      'No "Parameter Handler Factories" set. ' +
        'Use "parameterHandlerFactory()" method to add a "ParameterHandlerFactory" instance. ' +
        'You can use the default handlers by calling "useDefaults(true) (Will add other default components too."'
    )

    return new Drizzle(
      this._baseURL,
      this._callFactory,
      this._interceptors,
      this._interceptorFactories,
      new Set<CallAdapterFactory>(this._callAdapterFactories),
      this._parameterHandlerFactories,
      new Set<RequestBodyConverterFactory>(this._requestConverterFactories),
      new Set<ResponseConverterFactory>(this._responseConverterFactories),
      this._responseHandlerFactories
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
    this.addParameterHandlerFactory(ModelArgumentParameterHandlerFactory.INSTANCE)

    this.addRequestConverterFactories(new JsonRequestConverterFactory())
    this.addRequestConverterFactories(new FormRequestConverterFactory())
    this.addRequestConverterFactories(new RawRequestConverterFactory())

    this.addResponseConverterFactories(new JsonResponseConverterFactory())
    this.addResponseConverterFactories(new PlainTextResponseConverterFactory())
    this._responseConverterFactories.unshift(new RawResponseConverterFactory())

    this.addResponseHandlerFactory(new RawResponseHandlerFactory())

    this.addInterceptor(RetryInterceptorFactory.INSTANCE)
  }
}

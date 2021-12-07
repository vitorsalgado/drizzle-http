import { RequestBodyConverter } from './RequestBodyConverter'
import { RequestBodyConverterFactory } from './RequestBodyConverter'
import { serviceInvoker } from './drizzleServiceInvoker'
import { RequestFactory } from './RequestFactory'
import { DrizzleMeta } from './DrizzleMeta'
import { Interceptor } from './Interceptor'
import { RawRequestConverter, RawResponseConverter } from './internal'
import { NoParameterHandlerFoundForType } from './internal'
import { Parameter, ParameterHandlerFactory } from './internal'
import { HttpHeaders } from './HttpHeaders'
import { ResponseConverter } from './ResponseConverter'
import { ResponseConverterFactory } from './ResponseConverter'
import { CallAdapter } from './CallAdapter'
import { CallAdapterFactory } from './CallAdapter'
import { CallFactory } from './Call'
import { ResponseHandler } from './ResponseHandler'
import { ResponseHandlerFactory } from './ResponseHandler'
import { DefaultResponseHandler } from './ResponseHandler'

/**
 * Drizzle adapts a class to perform HTTP calls by using the decorators on the declared methods
 * to define how the requests should be made.
 * Create instances using Drizzle.Builder or {@link DrizzleBuilder}.
 *
 * @example
 const api = new Drizzle.Builder()
 .baseUrl(baseURL)
 .useDefaults()
 .addCallAdapterFactories(new RxJsCallAdapterFactory())
 .build()
 .create(API)
 */
export class Drizzle {
  private readonly shutdownHooks: (() => Promise<void>)[]

  constructor(
    public readonly baseUrl: string,
    public readonly headers: HttpHeaders,
    public readonly callFactory: CallFactory,
    private readonly _interceptors: Interceptor[],
    private readonly callAdapterFactories: Set<CallAdapterFactory>,
    private readonly _parameterHandlerFactories: ParameterHandlerFactory<Parameter, unknown>[],
    private readonly requestConverterFactories: Set<RequestBodyConverterFactory>,
    private readonly responseConverterFactories: Set<ResponseConverterFactory>,
    private readonly _responseHandlerFactories: ResponseHandlerFactory[]
  ) {
    this.shutdownHooks = []
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /**
   * Get all registered {@link Interceptor} instances
   * @returns All registered {@link Interceptor} instances
   */
  interceptors(): Interceptor[] {
    return [...this._interceptors]
  }

  /**
   * Get all registered {@link ParameterHandlerFactory} instances
   */
  parameterHandlerFactories(): ParameterHandlerFactory<Parameter, unknown>[] {
    return [...this._parameterHandlerFactories]
  }

  /**
   * Iterates the callAdapterFactories trying to get a {@link CallAdapter} for a request.
   *
   * @returns {@link CallAdapter} instance or null
   */
  callAdapter<F, T>(method: string, requestFactory: RequestFactory): CallAdapter<F, T> | null {
    if (!this.callAdapterFactories || this.callAdapterFactories.size === 0) {
      return null
    }

    for (const factory of this.callAdapterFactories) {
      const adapter = factory.provideCallAdapter(this, method, requestFactory)

      if (adapter !== null) {
        return adapter as CallAdapter<F, T>
      }
    }

    return null
  }

  /**
   * Search a {@link ParameterHandlerFactory} that handles the parameter type from argument
   *
   * @returns {@link ParameterHandlerFactory} instance
   * @throws {@link NoParameterHandlerFoundForType} if no factory is found for provided parameter type
   */
  parameterHandlerFactory<P extends Parameter, R>(
    requestFactory: RequestFactory,
    parameter: Parameter
  ): ParameterHandlerFactory<P, R> {
    const factory = this._parameterHandlerFactories.filter(x => x.handledType() === parameter.type)[0]

    if (factory === null || typeof factory === 'undefined') {
      throw new NoParameterHandlerFoundForType(parameter.type, requestFactory.method, parameter.index)
    }

    return factory as ParameterHandlerFactory<P, R>
  }

  /**
   * Iterates through all requestBodyConverterFactories to get {@link RequestBodyConverter}
   * to the request body.
   *
   * @returns {@link RequestBodyConverter} based on request configuration or
   *  {@link RawResponseConverter} instance when none is found
   */
  requestBodyConverter<R>(method: string, requestFactory: RequestFactory): RequestBodyConverter<R> {
    for (const factory of this.requestConverterFactories) {
      const converter = factory.requestConverter(this, method, requestFactory)

      if (converter !== null) {
        return converter as RequestBodyConverter<R>
      }
    }

    return RawRequestConverter.INSTANCE as unknown as RequestBodyConverter<R>
  }

  /**
   * Iterates through all responseBodyConverterFactories to get {@link ResponseConverter} to the response body.
   *
   * @returns {@link ResponseConverter} instance based on request configuration or
   *  {@link RawResponseConverter} when none is found.
   */
  responseBodyConverter<T>(method: string, requestFactory: RequestFactory): ResponseConverter<T> {
    if (requestFactory.noResponseConverter) {
      return RawResponseConverter.INSTANCE as unknown as ResponseConverter<T>
    }

    for (const factory of this.responseConverterFactories) {
      const converter = factory.responseBodyConverter(this, method, requestFactory)

      if (converter !== null) {
        return converter as ResponseConverter<T>
      }
    }

    return RawResponseConverter.INSTANCE as unknown as ResponseConverter<T>
  }

  /**
   * Search for response handler. If no none is found, returns {@link DefaultResponseHandler}.
   *
   * @returns {@link ResponseHandlerFactory} instance or {@link DefaultResponseHandler} if none is found for method.
   */
  responseHandler(method: string, requestFactory: RequestFactory): ResponseHandler {
    if (this._responseHandlerFactories.length === 0) {
      return new DefaultResponseHandler()
    }

    for (const factory of this._responseHandlerFactories) {
      const handler = factory.responseHandler(this, method, requestFactory)

      if (handler !== null) {
        return handler
      }
    }

    return new DefaultResponseHandler()
  }

  /**
   * Allows internal components to register shutdown hooks like cleanup functions
   *
   * @internal
   *
   * @param fn - shutdown async function
   */
  registerShutdownHook(fn: () => Promise<void>): void {
    this.shutdownHooks.push(fn)
  }

  /**
   * Executes all registered shutdown hooks
   */
  async shutdown(): Promise<void> {
    for (const hook of this.shutdownHooks) {
      await hook()
    }
  }

  /**
   * Creates a proxy instance of the class with decorated methods that perform HTTP requests based on decorated methods
   * configurations.
   *
   * @param TargetApi - the target API class with decorated methods
   * @returns A proxy instance of the target API class
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create<T extends { new (...args: any[]): any }>(TargetApi: T): InstanceType<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    // Extended version of the decorated API Class
    // This extended class will contain the implementations to execute the http requests based on configurations from
    // decorators and Drizzle instance
    class ExtendedTargetApi extends TargetApi {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(..._args: any[]) {
        super()

        this.name = `${TargetApi.name}_Extended`

        const invoker = serviceInvoker(self)
        const meta = DrizzleMeta.metaFor(TargetApi.name)

        for (const [method, requestFactory] of meta.requestFactories) {
          requestFactory.mergeWithInstanceMeta(meta.meta)
          requestFactory.preProcessAndValidate(self)

          this[method] = invoker(requestFactory, method)
        }

        DrizzleMeta.removeMetaFor(TargetApi.name)
      }
    }

    return new ExtendedTargetApi()
  }
}

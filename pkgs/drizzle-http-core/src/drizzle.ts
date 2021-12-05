import { CallAdapter, CallAdapterFactory } from './call.adapter'
import { RequestBodyConverter, RequestConverterFactory } from './request.body.converter'
import { serviceInvoker } from './drizzle.api.invoker'
import { ResponseConverter, ResponseConverterFactory } from './response.converter'
import { RequestFactory } from './request.factory'
import { DrizzleMeta } from './drizzle.meta'
import { CallFactory } from './call'
import { Interceptor } from './interceptor'
import { RawRequestConverter, RawResponseConverter } from './internal'
import { NoParameterHandlerFoundForType } from './internal'
import { Parameter, ParameterHandlerFactory } from './request.parameter.handler'
import { DzHeaders } from './http.headers'

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
    public readonly headers: DzHeaders,
    public readonly callFactory: CallFactory,
    private readonly _interceptors: Interceptor<unknown, unknown>[],
    private readonly callAdapterFactories: Set<CallAdapterFactory>,
    private readonly _parameterHandlerFactories: ParameterHandlerFactory<Parameter, unknown>[],
    private readonly requestConverterFactories: Set<RequestConverterFactory>,
    private readonly responseConverterFactories: Set<ResponseConverterFactory>
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
  interceptors(): Interceptor<unknown, unknown>[] {
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
  responseBodyConverter<F, T>(method: string, requestFactory: RequestFactory): ResponseConverter<F, T> {
    if (requestFactory.noResponseConverter) {
      return RawResponseConverter.INSTANCE as unknown as ResponseConverter<F, T>
    }

    for (const factory of this.responseConverterFactories) {
      const converter = factory.responseBodyConverter(this, method, requestFactory)

      if (converter !== null) {
        return converter as ResponseConverter<F, T>
      }
    }

    return RawResponseConverter.INSTANCE as unknown as ResponseConverter<F, T>
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
  create<T extends { new (...args: any[]): any }>(TargetApi: T) {
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

        const registeredMethods = DrizzleMeta.registeredMethods(TargetApi)
        const instanceMeta = DrizzleMeta.provideInstanceMetadata(TargetApi)

        for (const method of registeredMethods) {
          const requestFactory = DrizzleMeta.provideRequestFactory(TargetApi, method)
          requestFactory.mergeWithInstanceMeta(instanceMeta)
          requestFactory.preProcessAndValidate(self)

          this[method] = invoker(requestFactory, method)
        }
      }
    }

    return new ExtendedTargetApi()
  }
}

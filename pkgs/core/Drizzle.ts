/* eslint-disable @typescript-eslint/no-explicit-any */

import { RequestBodyConverter } from './RequestBodyConverter'
import { RequestBodyConverterFactory } from './RequestBodyConverter'
import { serviceInvoker } from './drizzleServiceInvoker'
import { RequestFactory } from './RequestFactory'
import { parameterizationForTarget } from './ApiParameterization'
import { Interceptor } from './Interceptor'
import { InterceptorFactory } from './Interceptor'
import { RawRequestConverter, RawResponseConverter } from './builtin'
import { Parameter, ParameterHandlerFactory } from './builtin'
import { ParameterHandler } from './builtin'
import { NoParameterHandlerError } from './internal'
import { AnyCtor } from './internal'
import { HttpHeaders } from './HttpHeaders'
import { ResponseConverter } from './ResponseConverter'
import { ResponseConverterFactory } from './ResponseConverter'
import { CallAdapter } from './CallAdapter'
import { CallAdapterFactory } from './CallAdapter'
import { CallFactory } from './Call'
import { ResponseHandler } from './ResponseHandler'
import { ResponseHandlerFactory } from './ResponseHandler'
import { DefaultResponseHandler } from './ResponseHandler'
import { NoopResponseHandler } from './ResponseHandler'

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
  constructor(
    private readonly _baseUrl: string,
    private readonly _headers: HttpHeaders,
    private readonly _callFactory: CallFactory,
    private readonly _interceptors: Interceptor[],
    private readonly _interceptorFactories: InterceptorFactory[],
    private readonly _callAdapterFactories: Set<CallAdapterFactory>,
    private readonly _parameterHandlerFactories: ParameterHandlerFactory<Parameter, unknown>[],
    private readonly _requestConverterFactories: Set<RequestBodyConverterFactory>,
    private readonly _responseConverterFactories: Set<ResponseConverterFactory>,
    private readonly _responseHandlerFactories: ResponseHandlerFactory[],
    private readonly _shutdownHooks: (() => Promise<unknown>)[] = []
  ) {}

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /**
   * Get the base url
   *
   * @returns string
   */
  baseUrl(): string {
    return this._baseUrl
  }

  /**
   * Get registered global {@link HttpHeaders}
   *
   * @returns HttpHeaders
   */
  headers(): HttpHeaders {
    return this._headers
  }

  /**
   * Get registered {@link CallFactory} instance
   *
   * @returns CallFactory
   */
  callFactory(): CallFactory {
    return this._callFactory
  }

  /**
   * Get all registered {@link Interceptor} instances.
   *
   * @returns Array<Interceptor>
   */
  interceptors(method: string, requestFactory: RequestFactory): Interceptor[] {
    return [
      ...this._interceptors,
      ...(this._interceptorFactories
        .map(x => x.provide(this, method, requestFactory))
        .filter(x => x !== null) as Interceptor[])
    ]
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
    if (!this._callAdapterFactories || this._callAdapterFactories.size === 0) {
      return null
    }

    for (const factory of this._callAdapterFactories) {
      const adapter = factory.provide(this, method, requestFactory)

      if (adapter !== null) {
        return adapter as CallAdapter<F, T>
      }
    }

    return null
  }

  /**
   * Search a {@link ParameterHandler} that handles the parameter type from argument
   *
   * @returns {@link ParameterHandler} instance
   * @throws {@link NoParameterHandlerError} if no handler is found for provided parameter type
   */
  parameterHandler<V>(requestFactory: RequestFactory, parameter: Parameter): ParameterHandler<V> {
    for (const factory of this._parameterHandlerFactories) {
      const handler = factory.provide(this, requestFactory, parameter)

      if (handler !== null) {
        return handler as ParameterHandler<V>
      }
    }

    throw new NoParameterHandlerError(parameter.type, requestFactory.method, parameter.index)
  }

  /**
   * Iterates through all requestBodyConverterFactories to get {@link RequestBodyConverter}
   * to the request body.
   *
   * @returns {@link RequestBodyConverter} based on request configuration or
   *  {@link RawResponseConverter} instance when none is found
   */
  requestBodyConverter<R>(method: string, requestFactory: RequestFactory): RequestBodyConverter<R> {
    for (const factory of this._requestConverterFactories) {
      const converter = factory.provide(this, method, requestFactory)

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

    for (const factory of this._responseConverterFactories) {
      const converter = factory.provide(this, method, requestFactory)

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
      return DefaultResponseHandler.INSTANCE
    }

    if (requestFactory.noResponseHandler) {
      return NoopResponseHandler.INSTANCE
    }

    for (const factory of this._responseHandlerFactories) {
      const handler = factory.provide(this, method, requestFactory)

      if (handler !== null) {
        return handler
      }
    }

    return DefaultResponseHandler.INSTANCE
  }

  /**
   * Allows internal components to register shutdown hooks like cleanup functions
   *
   * @internal
   *
   * @param fn - shutdown async function
   */
  registerShutdownHook(fn: () => Promise<unknown>): void {
    this._shutdownHooks.push(fn)
  }

  /**
   * Executes all registered shutdown hooks
   */
  async shutdown(): Promise<void> {
    for (const hook of this._shutdownHooks) {
      await hook()
    }
  }

  /**
   * Creates a proxy instance of the class with decorated methods that perform HTTP requests based on decorated methods
   * configurations.
   *
   * @param TargetApi - the target API class with decorated methods. use class and abstract class.
   * @param args - optional list of arguments to be passed to the api constructor.
   *
   * @returns A proxy instance of the target API class
   */
  create<T extends AnyCtor>(TargetApi: T, ...args: unknown[]): InstanceType<T> {
    const createApiInvocationMethod = serviceInvoker(this)
    const parameterization = parameterizationForTarget(TargetApi)

    function MIXIN<TBase extends AnyCtor>(superclass: TBase) {
      return class extends superclass {}
    }

    const Extended = MIXIN(TargetApi)
    const extendedApi = new Extended(...args)

    for (const [method, requestFactory] of parameterization.requestFactories) {
      requestFactory.mergeWithApiDefaults(parameterization.meta)
      requestFactory.preProcessAndValidate(this)

      requestFactory.defineInvoker(createApiInvocationMethod(requestFactory, method))
    }

    return extendedApi
  }
}

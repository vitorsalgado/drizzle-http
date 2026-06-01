/* eslint-disable @typescript-eslint/no-explicit-any */

import { RequestBodyConverter } from './RequestBodyConverter.js'
import { RequestBodyConverterFactory } from './RequestBodyConverter.js'
import { serviceInvoker } from './drizzleServiceInvoker.js'
import { RequestFactory } from './RequestFactory.js'
import { Metadata } from './ApiParameterization.js'
import { Interceptor } from './Interceptor.js'
import { InterceptorFactory } from './Interceptor.js'
import { RawRequestConverter, RawResponseConverter } from './builtin/index.js'
import { Parameter, ParameterHandlerFactory } from './builtin/index.js'
import { ParameterHandler } from './builtin/index.js'
import { RawResponse } from './builtin/index.js'
import { NoParameterHandlerError } from './internal/index.js'
import { AnyCtor } from './internal/index.js'
import { DrizzleError } from './internal/index.js'
import { ErrorCodes } from './internal/index.js'
import { ResponseConverter } from './ResponseConverter.js'
import { ResponseConverterFactory } from './ResponseConverter.js'
import { CallAdapter } from './CallAdapter.js'
import { CallAdapterFactory } from './CallAdapter.js'
import { CallFactory } from './Call.js'
import { ResponseHandler } from './ResponseHandler.js'
import { ResponseHandlerFactory } from './ResponseHandler.js'
import { DefaultResponseHandler } from './ResponseHandler.js'
import { NoopResponseHandler } from './ResponseHandler.js'
import { ParseErrorBody } from './decorators/index.js'

/**
 * Drizzle adapts a class to perform HTTP calls by using the decorators on the declared methods
 * to define how the requests should be made.
 * Create instances using Drizzle.Builder or {@link DrizzleBuilder}.
 *
 * @example
 const api = DrizzleBuilder.newBuilder()
 .baseUrl(baseURL)
 .addCallAdapterFactories(new RxJsCallAdapterFactory())
 .build()
 .create(API)
 */
export class Drizzle {
  public static DEFAULT_REQUEST_TYPE = 'json'
  public static DEFAULT_RESPONSE_TYPE = 'json'

  constructor(
    private readonly _baseUrl: string,
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

  private static MIXIN<TBase extends AnyCtor>(superclass: TBase) {
    return class extends superclass {}
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
  interceptors(requestFactory: RequestFactory): Interceptor[] {
    return [
      ...this._interceptors,
      ...(this._interceptorFactories.map(x => x.provide(this, requestFactory)).filter(x => x !== null) as Interceptor[])
    ]
  }

  /**
   * Get all registered {@link ParameterHandlerFactory} instances
   *
   * @returns ParameterHandlerFactory[]
   */
  parameterHandlerFactories(): ParameterHandlerFactory<Parameter, unknown>[] {
    return [...this._parameterHandlerFactories]
  }

  /**
   * Iterates the callAdapterFactories trying to get a {@link CallAdapter} for a request.
   *
   * @returns CallAdapter
   */
  callAdapter<F, T>(requestFactory: RequestFactory): CallAdapter<F, T> | null {
    if (!this._callAdapterFactories || this._callAdapterFactories.size === 0) {
      return null
    }

    for (const factory of this._callAdapterFactories) {
      const adapter = factory.provide(this, requestFactory)

      if (adapter !== null) {
        return adapter as CallAdapter<F, T>
      }
    }

    return null
  }

  /**
   * Search a {@link ParameterHandler} that handles the parameter type from argument
   *
   * @returns ParameterHandler
   * @throws NoParameterHandlerError
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
   * @returns RequestBodyConverter
   */
  requestBodyConverter<R>(requestFactory: RequestFactory, requestType?: string): RequestBodyConverter<R> {
    for (const factory of this._requestConverterFactories) {
      const converter = factory.provide(this, requestType || requestFactory.requestType, requestFactory)

      if (converter !== null) {
        return converter as RequestBodyConverter<R>
      }
    }

    return RawRequestConverter.INSTANCE as unknown as RequestBodyConverter<R>
  }

  /**
   * Iterates through all responseBodyConverterFactories to get {@link ResponseConverter} to the response body.
   *
   * @returns ResponseConverter
   */
  responseConverter<T>(requestFactory: RequestFactory, responseType?: string): ResponseConverter<T> {
    if (requestFactory.noResponseConverter || requestFactory.hasDecorator(RawResponse)) {
      return RawResponseConverter.INSTANCE as unknown as ResponseConverter<T>
    }

    for (const factory of this._responseConverterFactories) {
      const converter = factory.provide(this, responseType || requestFactory.responseType, requestFactory)

      if (converter !== null) {
        return converter as ResponseConverter<T>
      }
    }

    throw new DrizzleError(
      `No ResponseConverter for type "${responseType}" was found for method "${requestFactory.method}". ` +
        'Specify the response type on responseType/class level.',
      ErrorCodes.ERR_NO_RESPONSE_CONVERTER
    )
  }

  /**
   * Search for response handler. If no none is found, returns {@link DefaultResponseHandler}.
   *
   * @returns ResponseHandler
   */
  responseHandler(requestFactory: RequestFactory): ResponseHandler {
    if (requestFactory.noResponseHandler) {
      return NoopResponseHandler.INSTANCE
    }

    for (const factory of this._responseHandlerFactories) {
      const handler = factory.provide(this, requestFactory)

      if (handler !== null) {
        return handler
      }
    }

    const convertErrorBody = requestFactory.hasDecorator(ParseErrorBody)
    const responseConverter = requestFactory.errorType
      ? this.responseConverter<unknown>(requestFactory, requestFactory.errorType)
      : this.responseConverter<unknown>(requestFactory)

    return new DefaultResponseHandler(convertErrorBody, responseConverter)
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
   * @returns InstanceType<T>
   */
  create<T extends AnyCtor>(TargetApi: T, ...args: unknown[]): InstanceType<T> {
    const parameterization = Metadata.metadataFor(TargetApi)

    if (parameterization.requestFactories.size === 0) {
      throw new DrizzleError(
        `Class ${TargetApi.name} does not contain any api call method.`,
        ErrorCodes.ERR_EMPTY_API_CLASS
      )
    }

    const Extended = Drizzle.MIXIN(TargetApi)
    const extendedApi = new Extended(...args)
    const createApiInvocationMethod = serviceInvoker(this)

    for (const [method, requestFactory] of parameterization.requestFactories) {
      if (requestFactory.isPreProcessed()) {
        break
      }

      requestFactory.mergeWithApiDefaults(parameterization.meta)
      requestFactory.preProcessAndValidate(this)
      requestFactory.defineInvoker(createApiInvocationMethod(requestFactory, method))
    }

    return extendedApi
  }
}

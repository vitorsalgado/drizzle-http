import { RequestFactory } from './request.factory'
import { Drizzle } from './drizzle'
import { ExecutorChain } from './interceptor.http'
import { Interceptor } from './interceptor'
import { ResponseConverter } from './response.converter'
import { DzRequest } from './DzRequest'
import { DzResponse } from './DzResponse'

/**
 * Represents a single HTTP call.
 * New HTTP client implementations should extend this class.
 *
 * @typeParam V - handledType of the response
 */
export abstract class Call<T> {
  protected constructor(readonly request: DzRequest, readonly argv: unknown[]) {}

  /**
   * Executes the HTTP request
   */
  abstract execute(): T
}

export type CallProvider = (request: DzRequest, args: unknown[]) => Call<unknown>

/**
 * Builds a {@link Call} for a request.
 * Call<V> instances are created in the context of an HTTP request.
 */
export abstract class CallFactory {
  /**
   * Additional setupTestServer like register a shutdown hook
   * @param drizzle - Drizzle instance
   */
  setup(drizzle: Drizzle): void {
    // Overwrite to perform specific client setup
  }

  /**
   * Prepares the Call<V> that will make teh HTTP request.
   * It should return a Function you all stuff ready to make the request fast.
   *
   * @param drizzle - Drizzle instance
   * @param method - caller method name
   * @param requestFactory - {@link RequestFactory} associated with this call
   */
  abstract prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider
}

/**
 * Bridge from {@link Call} to the chain of {@link Interceptor}
 *
 * @typeParam V - Type of the response
 */
export class BridgeCall<T> extends Call<T> {
  private readonly responseConverter: ResponseConverter<DzResponse, T>
  private readonly chain: ExecutorChain<unknown, unknown>

  constructor(
    responseConverter: ResponseConverter<DzResponse, T>,
    interceptors: Interceptor<unknown, unknown>[],
    request: DzRequest,
    argv: unknown[]
  ) {
    super(request, argv)
    this.responseConverter = responseConverter
    this.chain = ExecutorChain.First(interceptors, request, argv)
  }

  execute(): T {
    return this.chain
      .proceed(this.request)
      .then(response => this.responseConverter.convert(response as DzResponse)) as unknown as T
  }
}

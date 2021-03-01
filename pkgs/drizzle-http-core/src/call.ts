import { RequestFactory } from './request.factory'
import { Drizzle } from './drizzle'
import { Request } from './request'
import { ExecutorChain } from './interceptor.http'
import { Interceptor } from './interceptor'

/**
 * Represents a single HTTP call.
 * New HTTP client implementations should extends this class.
 *
 * @typeParam V - handledType of the response
 */
export abstract class Call<T> {
  protected constructor(readonly request: Request, readonly argv: any[]) {}

  /**
   * Executes the HTTP request
   */
  abstract execute(): T
}

export type CallProvider = (request: Request, args: any[]) => Call<unknown>

/**
 * Builds a {@link Call} for a request.
 * Call<V> instances are created in the context of a HTTP request.
 */
export abstract class CallFactory {
  /**
   * Additional setupTestServer like register a shutdown hook
   * @param drizzle - Drizzle instance
   */
  abstract setup(drizzle: Drizzle): void

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
 * Bridge from {@link Call} to the a chain of {@link Interceptor}
 *
 * @typeParam V - Type of the response
 */
export class BridgeCall<T> extends Call<T> {
  private readonly chain: ExecutorChain<unknown, unknown>

  constructor(interceptors: Interceptor<unknown, unknown>[], request: Request, argv: any[]) {
    super(request, argv)
    this.chain = ExecutorChain.First(interceptors, request, argv)
  }

  execute(): T {
    return this.chain.proceed(this.request) as any
  }
}

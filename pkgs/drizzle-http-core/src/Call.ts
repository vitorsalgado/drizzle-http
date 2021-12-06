import { HttpRequest } from './HttpRequest'
import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'

/**
 * Represents a single HTTP call.
 * New HTTP client implementations should extend this class.
 *
 * @typeParam V - type of the response
 */
export abstract class Call<T> {
  protected constructor(readonly request: HttpRequest, readonly argv: unknown[]) {}

  /**
   * Executes the HTTP request
   */
  abstract execute(): T
}

export type CallProvider = (request: HttpRequest, args: unknown[]) => Call<unknown>

/**
 * Builds a {@link Call} for a request.
 * Call<V> instances are created in the context of an HTTP request.
 */
export abstract class CallFactory {
  /**
   * Additional setupTestServer like register a shutdown hook
   * @param drizzle - Drizzle instance
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

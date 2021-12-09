import { HttpRequest } from './HttpRequest'
import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'
import { HttpResponse } from './HttpResponse'

/**
 * Represents a single HTTP call.
 * New HTTP client implementations should extend this class.
 *
 * @typeParam V - type of the response
 */
export interface Call<T = HttpResponse> {
  readonly request: HttpRequest

  readonly argv: unknown[]

  /**
   * Executes the HTTP request
   */
  execute(): Promise<T>
}

export interface CallProvider<T = unknown> {
  (request: HttpRequest, args: unknown[]): Call<T>
}

/**
 * Builds a {@link Call} for a request.
 * Call<V> instances are created in the context of an HTTP request.
 */
export interface CallFactory {
  /**
   * Additional setupTestServer like register a shutdown hook
   * @param drizzle - Drizzle instance
   */
  setup(drizzle: Drizzle): void

  /**
   * Prepares the Call<V> that will make teh HTTP request.
   * It should return a Function you all stuff ready to make the request fast.
   *
   * @param drizzle - Drizzle instance
   * @param method - caller method name
   * @param requestFactory - {@link RequestFactory} associated with this call
   */
  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider
}

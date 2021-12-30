import { HttpRequest } from './HttpRequest.ts'
import { Drizzle } from './Drizzle.ts'
import { RequestFactory } from './RequestFactory.ts'
import { HttpResponse } from './HttpResponse.ts'

/**
 * Represents a single HTTP call.
 * New HTTP client implementations should extend this class.
 *
 * @typeParam V - type of the response
 */
export interface Call<T = HttpResponse> {
  /**
   * Executes the HTTP request
   */
  execute(request: HttpRequest, argv: unknown[]): Promise<T>
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
   * @param requestFactory - {@link RequestFactory} associated with this call
   */
  provide(drizzle: Drizzle, requestFactory: RequestFactory): Call<unknown>
}

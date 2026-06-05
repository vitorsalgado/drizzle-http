import { Call } from './call.js'
import { Drizzle } from './drizzle.js'
import { RequestFactory } from './request_factory.js'
import { HttpRequest } from './http_request.js'

/**
 * Adapts a {@link Call} with response F to a type of V
 *
 * @typeParam F - {@link Call} response type to convert from
 * @typeParam V - Type destination
 */
export interface CallAdapter<F, T> {
  adapt(call: Call<F>): (request: HttpRequest, argv: unknown[]) => T
}

/**
 * Builds {@link CallAdapter} for a request.
 */
export interface CallAdapterFactory {
  /**
   * This will execute outside a request context.
   * Every request will already have an instance of {@link CallAdapter} ready.
   *
   * @param drizzle - Drizzle instance
   * @param requestFactory - {@link RequestFactory} associated with this call
   */
  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null
}

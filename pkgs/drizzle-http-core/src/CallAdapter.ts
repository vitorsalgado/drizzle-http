import { Call } from './Call'
import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'

/**
 * Adapts a {@link Call} with response F to a type of V
 *
 * @typeParam F - {@link Call} response type to convert from
 * @typeParam V - Type destination
 */
export interface CallAdapter<F, T> {
  adapt(action: Call<F>): T
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
   * @param method - caller method name
   * @param requestFactory - {@link RequestFactory} associated with this call
   */
  provideCallAdapter(
    drizzle: Drizzle,
    method: string,
    requestFactory: RequestFactory
  ): CallAdapter<unknown, unknown> | null
}

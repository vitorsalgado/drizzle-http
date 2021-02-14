import { RequestFactory } from './request.factory'
import { Call } from './call'
import { Drizzle } from './drizzle'

/**
 * Adapts a {@link Call} with response F to a handledType of V
 *
 * @typeParam F - {@link Call} response handledType to convert from
 * @typeParam V - Type destination
 */
export interface CallAdapter<F, T> {
  adapt(action: Call<F>): T
}

/**
 * Builds {@link CallAdapter} for a request.
 */
export abstract class CallAdapterFactory {
  /**
   * This will execute outside of a request context.
   * Every request will already have a instance of {@link CallAdapter} ready.
   *
   * @param drizzle - Drizzle instance
   * @param method - caller method name
   * @param requestFactory - {@link RequestFactory} associated with this call
   */
  abstract provideCallAdapter(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null
}

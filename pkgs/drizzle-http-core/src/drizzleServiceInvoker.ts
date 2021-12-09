import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'
import { InterceptorHttpExecutor } from './InterceptorHttpExecutor'
import { notNull } from './internal'
import { notBlank } from './internal'
import { CallEntryPoint } from './CallEntryPoint'
import { Call } from './Call'
import { CallProvider } from './Call'
import { HttpResponse } from './HttpResponse'

/**
 * Service Invoker setups the method that should execute the actual Http request configured for each decorated method on
 * and API Class.
 *
 * @param drizzle - {@link Drizzle} instance
 * @typeParam V - Type of the response
 * @returns A function wrapping request context related information
 */
export function serviceInvoker(
  drizzle: Drizzle
): <T>(requestFactory: RequestFactory, method: string) => (...args: unknown[]) => T {
  notNull(drizzle, 'Drizzle instance cannot be null.')

  const callFactory = drizzle.callFactory()
  callFactory.setup(drizzle)

  /**
   * Holding Drizzle instance for each API decorated method
   * This way, each method can access configured components stored on Drizzle instance
   *
   * @param requestFactory - {@link RequestFactory}
   * @param method - caller method name
   * @returns The function that will execute the HTTP request
   */
  return function <T>(requestFactory: RequestFactory, method: string): (...args: unknown[]) => T {
    notNull(requestFactory, 'RequestFactory instance cannot be null.')
    notBlank(method, 'Method cannot be null or empty.')

    const callProvider = callFactory.prepareCall(drizzle, method, requestFactory) as CallProvider<HttpResponse>
    const callAdapter = drizzle.callAdapter<unknown, T>(method, requestFactory)
    const requestBuilder = requestFactory.requestBuilder(drizzle)
    const responseConverter = drizzle.responseBodyConverter<T>(method, requestFactory)
    const interceptors = drizzle.interceptors()
    const responseHandler = drizzle.responseHandler(method, requestFactory)

    interceptors.push(new InterceptorHttpExecutor(callProvider))

    // if method does not contain dynamic arguments, we don't need to resolve the Call<> instance on each method call.
    // Instead, we create the Call instance before entering the request execution context
    if (!requestFactory.containsDynamicParameters()) {
      const call = new CallEntryPoint(
        responseHandler,
        responseConverter,
        interceptors,
        method,
        requestFactory,
        requestBuilder.toRequest([]),
        []
      ) as Call<T>

      if (callAdapter !== null) {
        return function (): T {
          return callAdapter.adapt(call)
        }
      }

      return function (): T {
        return call.execute() as unknown as T
      }
    }

    /**
     * this is the function that actually makes the HTTP Request
     * it takes in consideration the method arguments and builds a {@link Call} instance on every execution
     *
     * @param args - function arguments usually decorated
     * @returns The response according to the method setupTestServer, {@link ResponseConverter}, {@link CallAdapter}
     */
    return function (...args: unknown[]): T {
      const call = new CallEntryPoint<T>(
        responseHandler,
        responseConverter,
        interceptors,
        method,
        requestFactory,
        requestBuilder.toRequest(args),
        args
      )

      if (callAdapter === null) {
        return call.execute() as unknown as T
      }

      return callAdapter.adapt(call)
    }
  }
}

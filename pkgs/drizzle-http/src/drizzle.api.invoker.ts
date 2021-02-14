import { Drizzle } from './drizzle'
import { RequestFactory } from './request.factory'
import { BridgeCall } from './call'
import { HttpExecInterceptor } from './interceptor.http'
import { Check } from './internal'

/**
 * Service Invoker setups the method that should execute the actual Http request configured for each decorated method on
 * and API Class.
 *
 * @param drizzle - {@link Drizzle} instance
 * @typeParam V - Type of the response
 * @returns A function wrapping request context related information
 */
export function serviceInvoker(drizzle: Drizzle): <T>(requestFactory: RequestFactory, method: string) => (...args: any[]) => T {
  Check.nullOrUndefined(drizzle, 'Drizzle instance cannot be null.')

  const callFactory = drizzle.callFactory
  callFactory.setup(drizzle)

  /**
   * Holding Drizzle instance for each API decorated method
   * This way, each method can access configured components stored on Drizzle instance
   *
   * @param requestFactory - {@link RequestFactory}
   * @param method - caller method name
   * @returns The function that will execute the HTTP request
   */
  return function <T>(requestFactory: RequestFactory, method: string): (...args: any[]) => T {
    Check.nullOrUndefined(requestFactory, 'RequestFactory instance cannot be null.')
    Check.emptyStr(method, 'Method cannot be null or empty.')

    const callProvider = callFactory.prepareCall(drizzle, method, requestFactory)
    const callAdapter = drizzle.callAdapter<unknown, T>(method, requestFactory)
    const requestBuilder = requestFactory.requestBuilder(drizzle)
    const interceptors = drizzle.interceptors()

    interceptors.push(new HttpExecInterceptor(callProvider))

    // if method does not contain dynamic arguments, you don't need to resolve the Call<> instance on each method call.
    // Instead, we create the Call instance before entering the request execution context
    if (!requestFactory.containsDynamicParameters()) {
      const call = new BridgeCall(interceptors, requestBuilder.toRequest([]), [])

      if (callAdapter !== null) {
        return function (): T {
          return callAdapter.adapt(call)
        }
      }

      return function (): T {
        return call.execute() as T
      }
    }

    /**
     * this is the function that actually makes the HTTP Request
     * it takes in consideration the method arguments and builds a {@link Call} instance on every execution
     *
     * @param args - function arguments usually decorated
     * @returns The response according to the method setupTestServer, {@link ResponseConverter}, {@link CallAdapter}
     */
    return function (...args: any[]): T {
      const call = new BridgeCall(interceptors, requestBuilder.toRequest(args), args)

      if (callAdapter === null) {
        return call.execute() as T
      }

      return callAdapter.adapt(call)
    }
  }
}

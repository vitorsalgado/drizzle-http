import { Drizzle } from "./Drizzle.ts";
import { RequestFactory } from "./RequestFactory.ts";
import { InterceptorHttpExecutor } from "./InterceptorHttpExecutor.ts";
import { notNull } from "./internal/mod.ts";
import { notBlank } from "./internal/mod.ts";
import { EntryPointInvoker } from "./EntryPointInvoker.ts";
import { Call } from "./Call.ts";

/**
 * Service Invoker setups the method that should execute the actual Http request configured for each decorated method on
 * and API Class.
 *
 * @param drizzle - {@link Drizzle} instance
 * @typeParam V - Type of the response
 */
export function serviceInvoker(
  drizzle: Drizzle,
): <T>(
  requestFactory: RequestFactory,
  method: string,
) => (...args: unknown[]) => T {
  notNull(drizzle, "Drizzle instance cannot be null.");

  const callFactory = drizzle.callFactory();

  callFactory.setup(drizzle);

  /**
   * Holding Drizzle instance for each API decorated method
   * This way, each method can access configured components stored on Drizzle instance
   *
   * @param requestFactory - {@link RequestFactory}
   * @param method - caller method name
   */
  return function <T>(
    requestFactory: RequestFactory,
    method: string,
  ): (...args: unknown[]) => T {
    notNull(requestFactory, "RequestFactory instance cannot be null.");
    notBlank(method, "Method cannot be null or empty.");

    const call = callFactory.provide(drizzle, requestFactory) as Call;
    const requestBuilder = requestFactory.requestBuilder(drizzle);
    const responseConverter = drizzle.responseConverter<T>(requestFactory);
    const interceptors = drizzle.interceptors(requestFactory);
    const responseHandler = drizzle.responseHandler(requestFactory);

    interceptors.push(new InterceptorHttpExecutor(call));

    const entrypoint: Call<unknown> = new EntryPointInvoker<T>(
      responseHandler,
      responseConverter,
      interceptors,
      method,
      requestFactory,
    );
    const callAdapter = drizzle.callAdapter<unknown, T>(requestFactory)
      ?.adapt(entrypoint);
    const hasAdapter = typeof callAdapter === "function";

    // if method does not contain dynamic arguments, we don't need to resolve the Call<> instance on each method call.
    // Instead, we create the Call instance before entering the request execution context
    if (!requestFactory.containsDynamicParameters()) {
      const request = requestBuilder.toRequest([]);

      if (hasAdapter) {
        return () => callAdapter(request, []);
      }

      return () => entrypoint.execute(request, []) as unknown as T;
    }

    /**
     * This is the function that makes the HTTP Request.
     * This method executes the {@link Call} instance with an adapter, if any.
     *
     * @param args - function arguments usually decorated
     */
    return function (...args: unknown[]) {
      const request = requestBuilder.toRequest(args);

      if (hasAdapter) {
        return callAdapter(request, args);
      }

      return entrypoint.execute(request, args) as unknown as T;
    };
  };
}

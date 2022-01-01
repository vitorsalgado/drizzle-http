// deno-lint-ignore-file no-unused-vars

import { Interceptor, InterceptorFactory } from "../../Interceptor.ts";
import { Drizzle } from "../../Drizzle.ts";
import { RequestFactory } from "../../RequestFactory.ts";
import { Retry, RetryOptionsKey } from "./Retry.ts";
import { RetryInterceptor } from "./RetryInterceptor.ts";
import { NoRetry } from "./NoRetry.ts";

export class RetryInterceptorFactory implements InterceptorFactory {
  static INSTANCE = new RetryInterceptorFactory();

  provide(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
  ): Interceptor | null {
    if (
      requestFactory.hasDecorator(Retry) &&
      !requestFactory.hasDecorator(NoRetry)
    ) {
      return new RetryInterceptor(requestFactory.getConfig(RetryOptionsKey));
    }

    return null;
  }
}

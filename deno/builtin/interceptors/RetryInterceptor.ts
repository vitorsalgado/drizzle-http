import { Interceptor } from "../../Interceptor.ts";
import { Chain } from "../../Chain.ts";
import { HttpMethod } from "../../decorators/utils/mod.ts";
import { RetryOptions } from "./Retry.ts";

type RetryInterceptorOptions = RetryOptions;

export class RetryInterceptor implements Interceptor {
  constructor(private readonly options: RetryInterceptorOptions) {
  }

  // deno-lint-ignore no-explicit-any
  private static isAsyncIterable(object: any) {
    return object != null && typeof object[Symbol.asyncIterator] === "function";
  }

  intercept(chain: Chain) {
    return this.retryable(chain, this.options.limit);
  }

  private retryable(
    chain: Chain,
    max = 1,
    current = 1,
  ): Promise<Response> {
    return new Promise((resolve) => {
      return chain.proceed(chain.request()).then(async (response) => {
        if (current === max) {
          return resolve(response);
        }

        if (
          !response.ok &&
          this.options.statusCodes.includes(response.status) &&
          this.options.methods.includes(chain.request().method as HttpMethod)
        ) {
          if (
            !response.bodyUsed && response.body &&
            RetryInterceptor.isAsyncIterable(response.body)
          ) {
            for await (const _ of response.body) {
              // consuming body ...
            }
          }

          setTimeout(
            () => resolve(this.retryable(chain, max, ++current)),
            this.options.delay,
          );
        } else {
          return resolve(response);
        }
      });
    });
  }
}

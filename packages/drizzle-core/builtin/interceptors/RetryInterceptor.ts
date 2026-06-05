import { Interceptor } from '../../Interceptor.js'
import { Chain } from '../../Chain.js'
import { HttpResponse } from '../../HttpResponse.js'
import { HttpMethod } from '../../decorators/utils/index.js'
import { RetryOptions } from './Retry.js'

type RetryInterceptorOptions = RetryOptions

export class RetryInterceptor implements Interceptor {
  constructor(private readonly options: RetryInterceptorOptions) {}

  private static isAsyncIterable(object: never): boolean {
    return object != null && typeof object[Symbol.asyncIterator] === 'function'
  }

  async intercept(chain: Chain): Promise<HttpResponse> {
    return this.retryable(chain, this.options.limit)
  }

  private retryable(chain: Chain, max = 1, current = 1): Promise<HttpResponse> {
    return new Promise(resolve => {
      return chain.proceed(chain.request()).then(async response => {
        if (current === max) {
          return resolve(response)
        }

        if (
          !response.ok &&
          this.options.statusCodes.includes(response.status) &&
          this.options.methods.includes(chain.request().method as HttpMethod)
        ) {
          if (!response.bodyUsed && response.body && RetryInterceptor.isAsyncIterable(response.body as never)) {
            for await (const _ of response.body as Iterable<unknown>) {
              void _
            }
          }

          setTimeout(() => resolve(this.retryable(chain, max, ++current)), this.options.delay)
        } else {
          return resolve(response)
        }
      })
    })
  }
}

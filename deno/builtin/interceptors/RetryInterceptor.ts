import { Interceptor } from '../../Interceptor.ts'
import { Chain } from '../../Chain.ts'
import { HttpResponse } from '../../HttpResponse.ts'
import { HttpMethod } from '../../decorators/utils/index.ts'
import { RetryOptions } from './Retry.ts'

type RetryInterceptorOptions = RetryOptions

export class RetryInterceptor implements Interceptor {
  constructor(private readonly options: RetryInterceptorOptions) {}

  private static isAsyncIterable(object: any): boolean {
    return object != null && typeof object[Symbol.asyncIterator] === 'function'
  }

  async intercept(chain: Chain): Promise<HttpResponse> {
    return this.retryable(chain, this.options.limit)
  }

  private retryable(chain: Chain, max: number = 1, current: number = 1): Promise<HttpResponse> {
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
          if (!response.bodyUsed && response.body && RetryInterceptor.isAsyncIterable(response.body)) {
            // eslint-disable-next-line no-empty,@typescript-eslint/no-unused-vars
            for await (const _ of response.body as Iterable<unknown>) {
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

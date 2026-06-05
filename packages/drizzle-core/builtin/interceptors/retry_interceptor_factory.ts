import { InterceptorFactory } from '../../interceptor.js'
import { Interceptor } from '../../interceptor.js'
import { Drizzle } from '../../drizzle.js'
import { RequestFactory } from '../../request_factory.js'
import { Retry } from './retry.js'
import { RetryOptionsKey } from './retry.js'
import { RetryInterceptor } from './retry_interceptor.js'
import { NoRetry } from './no_retry.js'

export class RetryInterceptorFactory implements InterceptorFactory {
  static INSTANCE: RetryInterceptorFactory = new RetryInterceptorFactory()

  provide(drizzle: Drizzle, requestFactory: RequestFactory): Interceptor | null {
    if (requestFactory.hasDecorator(Retry) && !requestFactory.hasDecorator(NoRetry)) {
      return new RetryInterceptor(requestFactory.getConfig(RetryOptionsKey))
    }

    return null
  }
}

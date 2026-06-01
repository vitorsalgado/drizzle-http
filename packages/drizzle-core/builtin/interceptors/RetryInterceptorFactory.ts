import { InterceptorFactory } from '../../Interceptor.js'
import { Interceptor } from '../../Interceptor.js'
import { Drizzle } from '../../Drizzle.js'
import { RequestFactory } from '../../RequestFactory.js'
import { Retry } from './Retry.js'
import { RetryOptionsKey } from './Retry.js'
import { RetryInterceptor } from './RetryInterceptor.js'
import { NoRetry } from './NoRetry.js'

export class RetryInterceptorFactory implements InterceptorFactory {
  static INSTANCE: RetryInterceptorFactory = new RetryInterceptorFactory()

  provide(drizzle: Drizzle, requestFactory: RequestFactory): Interceptor | null {
    if (requestFactory.hasDecorator(Retry) && !requestFactory.hasDecorator(NoRetry)) {
      return new RetryInterceptor(requestFactory.getConfig(RetryOptionsKey))
    }

    return null
  }
}

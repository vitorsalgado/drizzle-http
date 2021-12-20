import { InterceptorFactory } from '../../Interceptor'
import { Interceptor } from '../../Interceptor'
import { Drizzle } from '../../Drizzle'
import { RequestFactory } from '../../RequestFactory'
import { Retry } from './Retry'
import { RetryOptionsKey } from './Retry'
import { RetryInterceptor } from './RetryInterceptor'
import { NoRetry } from './NoRetry'

export class RetryInterceptorFactory implements InterceptorFactory {
  static INSTANCE: RetryInterceptorFactory = new RetryInterceptorFactory()

  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): Interceptor | null {
    if (requestFactory.hasDecorator(Retry) && !requestFactory.hasDecorator(NoRetry)) {
      return new RetryInterceptor(requestFactory.getConfig(RetryOptionsKey))
    }

    return null
  }
}

import { Chain } from './Chain'
import { HttpResponse } from './HttpResponse'
import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'

export interface Interceptor {
  intercept(chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFunction {
  (chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFactory {
  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): Interceptor | null
}

import { Chain } from './Chain.js'
import { HttpResponse } from './HttpResponse.js'
import { Drizzle } from './Drizzle.js'
import { RequestFactory } from './RequestFactory.js'

export interface Interceptor {
  intercept(chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFunction {
  (chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): Interceptor | null
}

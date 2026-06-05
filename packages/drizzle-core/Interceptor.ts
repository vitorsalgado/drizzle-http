import { Chain } from './chain.js'
import { HttpResponse } from './http_response.js'
import { Drizzle } from './drizzle.js'
import { RequestFactory } from './request_factory.js'

export interface Interceptor {
  intercept(chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFunction {
  (chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): Interceptor | null
}

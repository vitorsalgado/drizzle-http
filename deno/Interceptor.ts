import { Chain } from './Chain.ts'
import { HttpResponse } from './HttpResponse.ts'
import { Drizzle } from './Drizzle.ts'
import { RequestFactory } from './RequestFactory.ts'

export interface Interceptor {
  intercept(chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFunction {
  (chain: Chain): Promise<HttpResponse>
}

export interface InterceptorFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): Interceptor | null
}

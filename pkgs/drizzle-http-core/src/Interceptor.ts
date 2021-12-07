import { Chain } from './Chain'
import { HttpResponse } from './HttpResponse'

export interface Interceptor {
  intercept(chain: Chain): Promise<HttpResponse>
}

import { Interceptor } from './interceptor.js'
import { Chain } from './chain.js'
import { HttpResponse } from './http_response.js'
import { Call } from './call.js'

export class InterceptorHttpExecutor implements Interceptor {
  constructor(private readonly call: Call) {}

  intercept(chain: Chain): Promise<HttpResponse> {
    return this.call.execute(chain.request(), chain.argv())
  }
}

import { Interceptor } from './Interceptor.js'
import { Chain } from './Chain.js'
import { HttpResponse } from './HttpResponse.js'
import { Call } from './Call.js'

export class InterceptorHttpExecutor implements Interceptor {
  constructor(private readonly call: Call) {}

  intercept(chain: Chain): Promise<HttpResponse> {
    return this.call.execute(chain.request(), chain.argv())
  }
}

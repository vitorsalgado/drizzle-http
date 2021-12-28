import { Interceptor } from './Interceptor'
import { Chain } from './Chain'
import { HttpResponse } from './HttpResponse'
import { Call } from './Call'

export class InterceptorHttpExecutor implements Interceptor {
  constructor(private readonly call: Call) {}

  intercept(chain: Chain): Promise<HttpResponse> {
    return this.call.execute(chain.request(), chain.argv())
  }
}

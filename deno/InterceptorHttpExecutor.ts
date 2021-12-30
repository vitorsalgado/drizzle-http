import { Interceptor } from './Interceptor.ts'
import { Chain } from './Chain.ts'
import { HttpResponse } from './HttpResponse.ts'
import { Call } from './Call.ts'

export class InterceptorHttpExecutor implements Interceptor {
  constructor(private readonly call: Call) {}

  intercept(chain: Chain): Promise<HttpResponse> {
    return this.call.execute(chain.request(), chain.argv())
  }
}

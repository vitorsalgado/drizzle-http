import { CallProvider } from './Call'
import { Interceptor } from './Interceptor'
import { HttpResponse } from './HttpResponse'
import { Chain } from './Chain'

export class InterceptorHttpExecutor implements Interceptor {
  constructor(private readonly callProvider: CallProvider) {}

  async intercept(chain: Chain): Promise<HttpResponse> {
    return this.callProvider(chain.request(), chain.argv()).execute() as HttpResponse
  }
}

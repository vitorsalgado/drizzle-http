import { CallProvider } from './Call'
import { Interceptor } from './Interceptor'
import { HttpRequest } from './HttpRequest'
import { HttpResponse } from './HttpResponse'
import { Chain } from './Chain'

export class InterceptorHttpExecutor implements Interceptor<HttpRequest, HttpResponse> {
  constructor(private readonly callProvider: CallProvider) {}

  async intercept(chain: Chain<HttpRequest, HttpResponse>): Promise<HttpResponse> {
    return this.callProvider(chain.request(), chain.argv()).execute() as HttpResponse
  }
}

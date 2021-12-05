import { CallProvider } from './call'
import { Chain, Interceptor } from './interceptor'
import { DzRequest } from './DzRequest'
import { DzResponse } from './DzResponse'

export class HttpExecInterceptor implements Interceptor<DzRequest, DzResponse> {
  constructor(private readonly callProvider: CallProvider) {}

  async intercept(chain: Chain<DzRequest, DzResponse>): Promise<DzResponse> {
    return this.callProvider(chain.request(), chain.argv()).execute() as DzResponse
  }
}

export class ExecutorChain<TReq, TRes> implements Chain<TReq, TRes> {
  constructor(
    private readonly _index: number,
    private readonly _interceptors: Interceptor<TReq, TRes>[],
    private readonly _request: TReq,
    private readonly _argv: unknown[]
  ) {}

  static First<TReq, TRes>(
    interceptors: Interceptor<TReq, TRes>[],
    request: TReq,
    argv: unknown[]
  ): ExecutorChain<TReq, TRes> {
    return new ExecutorChain<TReq, TRes>(0, interceptors, request, argv)
  }

  proceed(request: TReq): Promise<TRes> {
    return this._interceptors[this._index].intercept(this.copy(this._index + 1, request))
  }

  request(): TReq {
    return this._request
  }

  argv(): unknown[] {
    return this._argv
  }

  copy(index: number, request: TReq): ExecutorChain<TReq, TRes> {
    return new ExecutorChain(index, this._interceptors, request, this._argv)
  }
}

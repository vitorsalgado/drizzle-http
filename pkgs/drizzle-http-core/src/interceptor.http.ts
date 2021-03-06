import { Request } from './request'
import { Response } from './response'
import { CallProvider } from './call'
import { Chain, Interceptor } from './interceptor'

export class HttpExecInterceptor implements Interceptor<Request, Response> {
  constructor(private readonly callProvider: CallProvider) {}

  async intercept(chain: Chain<Request, Response>): Promise<Response> {
    return this.callProvider(chain.request(), chain.argv()).execute() as Response
  }
}

export class ExecutorChain<TReq, TRes> implements Chain<TReq, TRes> {
  constructor(
    private readonly _index: number,
    private readonly _interceptors: Interceptor<TReq, TRes>[],
    private readonly _request: TReq,
    private readonly _argv: any[]
  ) {}

  static First<TReq, TRes>(
    interceptors: Interceptor<TReq, TRes>[],
    request: TReq,
    argv: any[]
  ): ExecutorChain<TReq, TRes> {
    return new ExecutorChain<TReq, TRes>(0, interceptors, request, argv)
  }

  proceed(request: TReq): Promise<TRes> {
    return this._interceptors[this._index].intercept(this.copy(this._index + 1, request))
  }

  request(): TReq {
    return this._request
  }

  argv(): any[] {
    return this._argv
  }

  copy(index: number, request: TReq): ExecutorChain<TReq, TRes> {
    return new ExecutorChain(index, this._interceptors, request, this._argv)
  }
}

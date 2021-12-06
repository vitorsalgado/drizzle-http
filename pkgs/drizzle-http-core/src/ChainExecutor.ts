import { Chain } from './Chain'
import { Interceptor } from './Interceptor'

export class ChainExecutor<TReq, TRes> implements Chain<TReq, TRes> {
  constructor(
    private readonly _index: number,
    private readonly _interceptors: Interceptor<TReq, TRes>[],
    private readonly _request: TReq,
    private readonly _argv: unknown[]
  ) {}

  static first<TReq, TRes>(
    interceptors: Interceptor<TReq, TRes>[],
    request: TReq,
    argv: unknown[]
  ): ChainExecutor<TReq, TRes> {
    return new ChainExecutor<TReq, TRes>(0, interceptors, request, argv)
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

  copy(index: number, request: TReq): ChainExecutor<TReq, TRes> {
    return new ChainExecutor(index, this._interceptors, request, this._argv)
  }
}

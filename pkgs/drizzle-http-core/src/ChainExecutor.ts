import { Chain } from './Chain'
import { Interceptor } from './Interceptor'
import { HttpRequest } from './HttpRequest'
import { HttpResponse } from './HttpResponse'

export class ChainExecutor implements Chain {
  constructor(
    private readonly _index: number,
    private readonly _interceptors: Interceptor[],
    private readonly _request: HttpRequest,
    private readonly _argv: unknown[]
  ) {}

  static first(interceptors: Interceptor[], request: HttpRequest, argv: unknown[]): ChainExecutor {
    return new ChainExecutor(0, interceptors, request, argv)
  }

  proceed(request: HttpRequest): Promise<HttpResponse> {
    return this._interceptors[this._index].intercept(this.copy(this._index + 1, request))
  }

  request(): HttpRequest {
    return this._request
  }

  argv(): unknown[] {
    return this._argv
  }

  copy(index: number, request: HttpRequest): ChainExecutor {
    return new ChainExecutor(index, this._interceptors, request, this._argv)
  }
}

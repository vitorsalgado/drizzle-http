import { Chain } from './Chain'
import { Interceptor } from './Interceptor'
import { HttpRequest } from './HttpRequest'
import { HttpResponse } from './HttpResponse'
import { RequestFactory } from './RequestFactory'

export class ChainExecutor implements Chain {
  constructor(
    private readonly _index: number,
    private readonly _interceptors: Interceptor[],
    private readonly _method: string,
    private readonly _requestFactory: RequestFactory,
    private readonly _request: HttpRequest,
    private readonly _argv: unknown[]
  ) {}

  static first(
    interceptors: Interceptor[],
    method: string,
    requestFactory: RequestFactory,
    request: HttpRequest,
    argv: unknown[]
  ): ChainExecutor {
    return new ChainExecutor(0, interceptors, method, requestFactory, request, argv)
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

  method(): string {
    return this._method
  }

  requestFactory(): RequestFactory {
    return this._requestFactory
  }

  copy(index: number, request: HttpRequest): ChainExecutor {
    return new ChainExecutor(index, this._interceptors, this._method, this._requestFactory, request, this._argv)
  }
}

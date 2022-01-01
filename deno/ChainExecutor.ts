import { Chain } from "./Chain.ts";
import { Interceptor } from "./Interceptor.ts";
import { HttpRequest } from "./HttpRequest.ts";
import { RequestFactory } from "./RequestFactory.ts";

export class ChainExecutor implements Chain {
  constructor(
    private readonly _index: number,
    private readonly _interceptors: Interceptor[],
    private readonly _method: string,
    private readonly _requestFactory: RequestFactory,
    private readonly _request: HttpRequest,
    private readonly _argv: unknown[],
  ) {
  }

  static first(
    interceptors: Interceptor[],
    method: string,
    requestFactory: RequestFactory,
    request: HttpRequest,
    argv: unknown[],
  ) {
    return new ChainExecutor(
      0,
      interceptors,
      method,
      requestFactory,
      request,
      argv,
    );
  }

  proceed(request: HttpRequest): Promise<Response> {
    return this._interceptors[this._index].intercept(
      this.copy(this._index + 1, request),
    );
  }

  request() {
    return this._request;
  }

  argv() {
    return this._argv;
  }

  method() {
    return this._method;
  }

  requestFactory() {
    return this._requestFactory;
  }

  copy(index: number, request: HttpRequest) {
    return new ChainExecutor(
      index,
      this._interceptors,
      this._method,
      this._requestFactory,
      request,
      this._argv,
    );
  }
}

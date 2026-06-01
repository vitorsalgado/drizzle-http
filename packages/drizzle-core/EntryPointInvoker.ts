import { Interceptor } from './Interceptor.js'
import { HttpRequest } from './HttpRequest.js'
import { Call } from './Call.js'
import { ResponseConverter } from './ResponseConverter.js'
import { ChainExecutor } from './ChainExecutor.js'
import { ResponseHandler } from './ResponseHandler.js'
import { RequestFactory } from './RequestFactory.js'

/**
 * This is the entrypoint for all requests.
 * This class executes the chain of core components making the framework request/response pipeline work.
 * The workflow:
 *  - Executes the chain of {@link Interceptor}
 *  - Executes the HTTP request
 *  - Executes the {@link ResponseHandler}
 *  - Executes the {@link ResponseConverter}
 *
 *  - The serviceInvoker will try to adapt this class with a {@link CallAdapter} instance
 *
 * @typeParam V - Type of the response
 */
export class EntryPointInvoker<T> implements Call<T> {
  constructor(
    private readonly responseHandler: ResponseHandler,
    private readonly responseConverter: ResponseConverter<T>,
    private readonly interceptors: Interceptor[],
    private readonly method: string,
    private readonly requestFactory: RequestFactory
  ) {}

  execute(request: HttpRequest, argv: unknown[]): Promise<T> {
    return ChainExecutor.first(this.interceptors, this.method, this.requestFactory, request, argv)
      .proceed(request)
      .then(response => this.responseHandler.handle(argv, request, response))
      .then(this.responseConverter.convert)
  }
}

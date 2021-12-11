import { Interceptor } from './Interceptor'
import { HttpRequest } from './HttpRequest'
import { Call } from './Call'
import { ResponseConverter } from './ResponseConverter'
import { ChainExecutor } from './ChainExecutor'
import { ResponseHandler } from './ResponseHandler'
import { RequestFactory } from './RequestFactory'

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
export class CallRequestEntryPoint<T> implements Call<T> {
  private readonly responseHandler: ResponseHandler
  private readonly responseConverter: ResponseConverter<T>
  private readonly chain: ChainExecutor

  constructor(
    responseHandler: ResponseHandler,
    responseConverter: ResponseConverter<T>,
    interceptors: Interceptor[],
    method: string,
    requestFactory: RequestFactory,
    readonly request: HttpRequest,
    readonly argv: unknown[]
  ) {
    this.responseHandler = responseHandler
    this.responseConverter = responseConverter
    this.chain = ChainExecutor.first(interceptors, method, requestFactory, request, argv)
  }

  execute(): Promise<T> {
    return this.chain
      .proceed(this.request)
      .then(response => this.responseHandler.handle(this.request, response))
      .then(this.responseConverter.convert)
  }
}

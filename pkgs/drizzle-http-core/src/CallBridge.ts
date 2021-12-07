import { Interceptor } from './Interceptor'
import { HttpRequest } from './HttpRequest'
import { Call } from './Call'
import { ResponseConverter } from './ResponseConverter'
import { ChainExecutor } from './ChainExecutor'
import { ResponseHandler } from './ResponseHandler'

/**
 * Bridge from {@link Call} to the chain of {@link Interceptor}
 *
 * @typeParam V - Type of the response
 */
export class CallBridge<T> implements Call<T> {
  private readonly responseHandler: ResponseHandler
  private readonly responseConverter: ResponseConverter<T>
  private readonly chain: ChainExecutor

  constructor(
    responseHandler: ResponseHandler,
    responseConverter: ResponseConverter<T>,
    interceptors: Interceptor[],
    readonly request: HttpRequest,
    readonly argv: unknown[]
  ) {
    this.responseHandler = responseHandler
    this.responseConverter = responseConverter
    this.chain = ChainExecutor.first(interceptors, request, argv)
  }

  execute(): T {
    return this.chain
      .proceed(this.request)
      .then(response => this.responseHandler.handle(this.request, response))
      .then(this.responseConverter.convert) as unknown as T
  }
}

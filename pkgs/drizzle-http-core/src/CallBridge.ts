import { HttpResponse } from './HttpResponse'
import { Interceptor } from './Interceptor'
import { HttpRequest } from './HttpRequest'
import { Call } from './Call'
import { ResponseConverter } from './ResponseConverter'
import { ChainExecutor } from './ChainExecutor'

/**
 * Bridge from {@link Call} to the chain of {@link Interceptor}
 *
 * @typeParam V - Type of the response
 */
export class CallBridge<T> extends Call<T> {
  private readonly responseConverter: ResponseConverter<HttpResponse, T>
  private readonly chain: ChainExecutor<unknown, unknown>

  constructor(
    responseConverter: ResponseConverter<HttpResponse, T>,
    interceptors: Interceptor<unknown, unknown>[],
    request: HttpRequest,
    argv: unknown[]
  ) {
    super(request, argv)
    this.responseConverter = responseConverter
    this.chain = ChainExecutor.first(interceptors, request, argv)
  }

  execute(): T {
    return this.chain
      .proceed(this.request)
      .then(response => this.responseConverter.convert(response as HttpResponse)) as unknown as T
  }
}

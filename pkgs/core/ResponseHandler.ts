import { HttpResponse } from './HttpResponse'
import { RequestFactory } from './RequestFactory'
import { Drizzle } from './Drizzle'
import { HttpError } from './HttpError'
import { HttpRequest } from './HttpRequest'
import { ResponseConverter } from './ResponseConverter'

export interface ResponseHandler {
  handle(argv: unknown[], request: HttpRequest, response: HttpResponse): Promise<HttpResponse>
}

export interface ResponseHandlerFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): ResponseHandler | null
}

export class DefaultResponseHandler implements ResponseHandler {
  constructor(
    private readonly convertErrorBody: boolean,
    private readonly responseConverter: ResponseConverter<unknown>
  ) {}

  async handle(argv: unknown[], request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    if (response.ok) {
      return response
    }

    let data = null

    if (!this.convertErrorBody) {
      if (!response.bodyUsed && response.body) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of response?.body) {
          // consuming error body ...
        }
      }
    } else {
      if (!response.bodyUsed) {
        data = await this.responseConverter.convert(response)
      }
    }

    throw new HttpError(request, {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: response.headers,
      body: data
    })
  }
}

export class NoopResponseHandler implements ResponseHandler {
  static INSTANCE: NoopResponseHandler = new NoopResponseHandler()

  async handle(argv: unknown[], request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    return response
  }
}

import { HttpResponse } from './HttpResponse.js'
import { RequestFactory } from './RequestFactory.js'
import { Drizzle } from './Drizzle.js'
import { HttpError } from './HttpError.js'
import { HttpRequest } from './HttpRequest.js'
import { ResponseConverter } from './ResponseConverter.js'

/**
 * Handles a {@link HttpResponse}.
 */
export interface ResponseHandler {
  handle(argv: unknown[], request: HttpRequest, response: HttpResponse): Promise<HttpResponse>
}

/**
 * Builds a {@link ResponseHandler} instance.
 */
export interface ResponseHandlerFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): ResponseHandler | null
}

/**
 * Default {@link ResponseHandler} implementation.
 * If response is not ok, it throws an {@link HttpError}.
 * When decorated with {@link RawResponse}, this response handler will be ignored and the response will be passed as is.
 */
export class DefaultResponseHandler implements ResponseHandler {
  constructor(
    private readonly convertErrorBody: boolean,
    private readonly responseConverter: ResponseConverter<unknown>
  ) {}

  /**
   * Handles the HTTP response and throws an error if status code is not success.
   *
   * @param argv - api method arguments collection
   * @param request - request instance
   * @param response - actual HTTP response
   *
   * @throws HttpError
   * @returns Promise<HttpResponse>
   */
  async handle(argv: unknown[], request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    if (response.ok) {
      return response
    }

    let body: unknown = null

    if (this.convertErrorBody) {
      if (!response.bodyUsed) {
        body = await this.responseConverter.convert(response)
      }
    } else {
      if (!response.bodyUsed && response.body) {
        try {
          body = await response.text()
        } finally {
        }
      }
    }

    throw new HttpError(request, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body
    })
  }
}

/**
 * Empty {@link ResponseHandler} implementation.
 * Used when {@link HttpResponse} should be returned as is.
 */
export class NoopResponseHandler implements ResponseHandler {
  static INSTANCE: NoopResponseHandler = new NoopResponseHandler()

  async handle(argv: unknown[], request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    return response
  }
}

import { HttpResponse } from './HttpResponse'
import { RequestFactory } from './RequestFactory'
import { Drizzle } from './Drizzle'
import { HttpError } from './HttpError'
import { HttpRequest } from './HttpRequest'

export interface ResponseHandler {
  handle(request: HttpRequest, response: HttpResponse): Promise<HttpResponse>
}

export interface ResponseHandlerFactory {
  responseHandler(drizzle: Drizzle, method: string, requestFactory: RequestFactory): ResponseHandler | null
}

export class DefaultResponseHandler implements ResponseHandler {
  static INSTANCE: DefaultResponseHandler = new DefaultResponseHandler()

  async handle(request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    if (response.ok) {
      return response
    }

    if (typeof response.ok === 'undefined') {
      return response
    }

    throw new HttpError(request, response)
  }
}

export class NoopResponseHandler implements ResponseHandler {
  static INSTANCE: NoopResponseHandler = new NoopResponseHandler()

  async handle(request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    return response
  }
}

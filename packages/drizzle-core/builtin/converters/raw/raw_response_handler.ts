import { ResponseHandler } from '../../../response_handler.js'
import { ResponseHandlerFactory } from '../../../response_handler.js'
import { HttpRequest } from '../../../http_request.js'
import { HttpResponse } from '../../../http_response.js'
import { Drizzle } from '../../../drizzle.js'
import { RequestFactory } from '../../../request_factory.js'
import { RawResponse } from './raw_response.js'

export class RawResponseHandler implements ResponseHandler {
  static INSTANCE: RawResponseHandler = new RawResponseHandler()

  async handle(argv: unknown[], request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    return response
  }
}

export class RawResponseHandlerFactory implements ResponseHandlerFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): ResponseHandler | null {
    if (requestFactory.hasDecorator(RawResponse)) {
      return RawResponseHandler.INSTANCE
    }

    return null
  }
}

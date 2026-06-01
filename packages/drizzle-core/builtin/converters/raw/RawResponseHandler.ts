import { ResponseHandler } from '../../../ResponseHandler.js'
import { ResponseHandlerFactory } from '../../../ResponseHandler.js'
import { HttpRequest } from '../../../HttpRequest.js'
import { HttpResponse } from '../../../HttpResponse.js'
import { Drizzle } from '../../../Drizzle.js'
import { RequestFactory } from '../../../RequestFactory.js'
import { RawResponse } from './RawResponse.js'

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

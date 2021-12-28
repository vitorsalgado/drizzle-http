import { ResponseHandler } from '../../../ResponseHandler'
import { ResponseHandlerFactory } from '../../../ResponseHandler'
import { HttpRequest } from '../../../HttpRequest'
import { HttpResponse } from '../../../HttpResponse'
import { Drizzle } from '../../../Drizzle'
import { RequestFactory } from '../../../RequestFactory'
import { RawResponse } from './RawResponse'

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

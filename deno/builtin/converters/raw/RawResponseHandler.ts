import { ResponseHandler } from '../../../ResponseHandler.ts'
import { ResponseHandlerFactory } from '../../../ResponseHandler.ts'
import { HttpRequest } from '../../../HttpRequest.ts'
import { HttpResponse } from '../../../HttpResponse.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { RequestFactory } from '../../../RequestFactory.ts'
import { RawResponse } from './RawResponse.ts'

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

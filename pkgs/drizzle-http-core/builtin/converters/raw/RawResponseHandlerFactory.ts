import { ResponseHandler } from '../../../ResponseHandler'
import { ResponseHandlerFactory } from '../../../ResponseHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { Keys } from './Keys'
import { RawResponseHandler } from './RawResponseHandler'

export class RawResponseHandlerFactory implements ResponseHandlerFactory {
  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): ResponseHandler | null {
    if (requestFactory.isReturnIdentifier(Keys.ReturnIdentifier)) {
      return new RawResponseHandler()
    }

    return null
  }
}

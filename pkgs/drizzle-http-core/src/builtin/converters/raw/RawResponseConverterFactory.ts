import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { HttpResponse } from '../../../HttpResponse'
import { ResponseConverter } from '../../../ResponseConverter'
import { ResponseConverterFactory } from '../../../ResponseConverter'
import { RawResponseConverter } from './RawResponseConverter'
import { Keys } from './Keys'

export class RawResponseConverterFactory implements ResponseConverterFactory {
  static INSTANCE: RawResponseConverterFactory = new RawResponseConverterFactory()

  responseBodyConverter(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<HttpResponse> | null {
    if (requestFactory.isReturnIdentifier(Keys.ReturnIdentifier)) {
      return RawResponseConverter.INSTANCE
    }

    return null
  }
}

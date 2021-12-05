import { ResponseConverterFactory } from '../../../../response.converter'
import { ResponseConverter } from '../../../../response.converter'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { DzResponse } from '../../../../DzResponse'
import { RawResponseConverter } from './RawResponseConverter'
import { Keys } from './Keys'

export class RawResponseConverterFactory extends ResponseConverterFactory {
  static INSTANCE: RawResponseConverterFactory = new RawResponseConverterFactory()

  responseBodyConverter(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<DzResponse, Promise<DzResponse>> | null {
    if (requestFactory.isReturnIdentifier(Keys.ReturnIdentifier)) {
      return RawResponseConverter.INSTANCE
    }

    return null
  }
}

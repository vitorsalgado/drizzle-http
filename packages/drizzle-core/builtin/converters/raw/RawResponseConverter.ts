import { HttpResponse } from '../../../HttpResponse.js'
import { ResponseConverter } from '../../../ResponseConverter.js'
import { ResponseConverterFactory } from '../../../ResponseConverter.js'
import { Drizzle } from '../../../Drizzle.js'
import { RequestFactory } from '../../../RequestFactory.js'
import { RawResponse } from './RawResponse.js'

export class RawResponseConverter implements ResponseConverter<HttpResponse> {
  static INSTANCE: RawResponseConverter = new RawResponseConverter()

  async convert(from: HttpResponse): Promise<HttpResponse> {
    return from
  }
}

export class RawResponseConverterFactory implements ResponseConverterFactory {
  static INSTANCE: RawResponseConverterFactory = new RawResponseConverterFactory()

  provide(
    _drizzle: Drizzle,
    _responseType: string,
    requestFactory: RequestFactory
  ): ResponseConverter<HttpResponse> | null {
    if (requestFactory.hasDecorator(RawResponse)) {
      return RawResponseConverter.INSTANCE
    }

    return null
  }
}

import { HttpResponse } from '../../../http_response.js'
import { ResponseConverter } from '../../../response_converter.js'
import { ResponseConverterFactory } from '../../../response_converter.js'
import { Drizzle } from '../../../drizzle.js'
import { RequestFactory } from '../../../request_factory.js'
import { RawResponse } from './raw_response.js'

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

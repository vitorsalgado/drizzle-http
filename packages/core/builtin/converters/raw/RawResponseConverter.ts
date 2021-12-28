import { HttpResponse } from '../../../HttpResponse'
import { ResponseConverter } from '../../../ResponseConverter'
import { ResponseConverterFactory } from '../../../ResponseConverter'
import { Drizzle } from '../../../Drizzle'
import { RequestFactory } from '../../../RequestFactory'
import { RawResponse } from './RawResponse'

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

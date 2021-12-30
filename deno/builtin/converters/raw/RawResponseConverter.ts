import { HttpResponse } from '../../../HttpResponse.ts'
import { ResponseConverter } from '../../../ResponseConverter.ts'
import { ResponseConverterFactory } from '../../../ResponseConverter.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { RequestFactory } from '../../../RequestFactory.ts'
import { RawResponse } from './RawResponse.ts'

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

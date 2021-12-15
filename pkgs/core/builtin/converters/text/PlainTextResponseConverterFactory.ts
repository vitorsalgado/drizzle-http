import { ResponseConverterFactory } from '../../../ResponseConverter'
import { ResponseConverter } from '../../../ResponseConverter'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { HttpResponse } from '../../../HttpResponse'
import { MediaTypes } from '../../../MediaTypes'

class PlainTextResponseConverter implements ResponseConverter<string> {
  static INSTANCE: PlainTextResponseConverter = new PlainTextResponseConverter()

  convert(from: HttpResponse): Promise<string> {
    return from.text()
  }
}

export class PlainTextResponseConverterFactory implements ResponseConverterFactory {
  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): ResponseConverter<unknown> | null {
    if (requestFactory.contentTypeContains(MediaTypes.TEXT_PLAIN)) {
      return PlainTextResponseConverter.INSTANCE
    }

    return null
  }
}

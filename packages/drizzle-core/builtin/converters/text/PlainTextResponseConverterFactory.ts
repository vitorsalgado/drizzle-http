import { ResponseConverterFactory } from '../../../ResponseConverter'
import { ResponseConverter } from '../../../ResponseConverter'
import { Drizzle } from '../../../Drizzle'
import { HttpResponse } from '../../../HttpResponse'
import { BuiltInConv } from '../../BuiltInConv'

class PlainTextResponseConverter implements ResponseConverter<string> {
  static INSTANCE: PlainTextResponseConverter = new PlainTextResponseConverter()

  async convert(from: HttpResponse): Promise<string> {
    if (from.status === 204) {
      return ''
    }

    return from.text()
  }
}

export class PlainTextResponseConverterFactory implements ResponseConverterFactory {
  provide(drizzle: Drizzle, responseType: string): ResponseConverter<unknown> | null {
    if (responseType === BuiltInConv.TEXT) {
      return PlainTextResponseConverter.INSTANCE
    }

    return null
  }
}

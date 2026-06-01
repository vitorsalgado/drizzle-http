import { ResponseConverterFactory } from '../../../ResponseConverter.js'
import { ResponseConverter } from '../../../ResponseConverter.js'
import { Drizzle } from '../../../Drizzle.js'
import { HttpResponse } from '../../../HttpResponse.js'
import { BuiltInConv } from '../../BuiltInConv.js'

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

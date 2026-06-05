import { ResponseConverterFactory } from '../../../response_converter.js'
import { ResponseConverter } from '../../../response_converter.js'
import { Drizzle } from '../../../drizzle.js'
import { HttpResponse } from '../../../http_response.js'
import { BuiltInConv } from '../../built_in_conv.js'

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

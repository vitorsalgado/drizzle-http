import { ResponseConverterFactory } from '../../../ResponseConverter.ts'
import { ResponseConverter } from '../../../ResponseConverter.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { HttpResponse } from '../../../HttpResponse.ts'
import { BuiltInConv } from '../../BuiltInConv.ts'

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

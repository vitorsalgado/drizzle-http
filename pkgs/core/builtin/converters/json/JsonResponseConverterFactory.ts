import { Drizzle } from '../../../Drizzle'
import { ResponseConverter } from '../../../ResponseConverter'
import { ResponseConverterFactory } from '../../../ResponseConverter'
import { BuiltInConv } from '../../BuiltInConv'
import { RequestFactory } from '../../../RequestFactory'
import { JsonResponseConverter } from './JsonResponseConverter'

export class JsonResponseConverterFactory implements ResponseConverterFactory {
  static INSTANCE: JsonResponseConverterFactory = new JsonResponseConverterFactory()

  provide<T>(drizzle: Drizzle, responseType: string, requestFactory: RequestFactory): ResponseConverter<T> | null {
    if (responseType === BuiltInConv.JSON) {
      return JsonResponseConverter.INSTANCE
    }

    return null
  }
}

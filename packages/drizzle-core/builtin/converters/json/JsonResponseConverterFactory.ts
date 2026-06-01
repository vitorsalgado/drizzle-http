import { Drizzle } from '../../../Drizzle.js'
import { ResponseConverter } from '../../../ResponseConverter.js'
import { ResponseConverterFactory } from '../../../ResponseConverter.js'
import { BuiltInConv } from '../../BuiltInConv.js'
import { RequestFactory } from '../../../RequestFactory.js'
import { JsonResponseConverter } from './JsonResponseConverter.js'

export class JsonResponseConverterFactory implements ResponseConverterFactory {
  static INSTANCE: JsonResponseConverterFactory = new JsonResponseConverterFactory()

  provide<T>(drizzle: Drizzle, responseType: string, _requestFactory: RequestFactory): ResponseConverter<T> | null {
    if (responseType === BuiltInConv.JSON) {
      return JsonResponseConverter.INSTANCE
    }

    return null
  }
}

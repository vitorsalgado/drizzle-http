import { Drizzle } from '../../../drizzle.js'
import { ResponseConverter } from '../../../response_converter.js'
import { ResponseConverterFactory } from '../../../response_converter.js'
import { BuiltInConv } from '../../built_in_conv.js'
import { RequestFactory } from '../../../request_factory.js'
import { JsonResponseConverter } from './json_response_converter.js'

export class JsonResponseConverterFactory implements ResponseConverterFactory {
  static INSTANCE: JsonResponseConverterFactory = new JsonResponseConverterFactory()

  provide<T>(drizzle: Drizzle, responseType: string, _requestFactory: RequestFactory): ResponseConverter<T> | null {
    if (responseType === BuiltInConv.JSON) {
      return JsonResponseConverter.INSTANCE
    }

    return null
  }
}

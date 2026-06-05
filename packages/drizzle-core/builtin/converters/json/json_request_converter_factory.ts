import { RequestBodyConverter } from '../../../request_body_converter.js'
import { RequestBodyConverterFactory } from '../../../request_body_converter.js'
import { Drizzle } from '../../../drizzle.js'
import { BuiltInConv } from '../../built_in_conv.js'
import { RequestFactory } from '../../../request_factory.js'
import { JsonRequestConverter } from './json_request_converter.js'

export class JsonRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: JsonRequestConverterFactory = new JsonRequestConverterFactory()

  provide(
    drizzle: Drizzle,
    requestType: string,
    _requestFactory: RequestFactory
  ): RequestBodyConverter<unknown> | null {
    if (requestType === BuiltInConv.JSON) {
      return JsonRequestConverter.INSTANCE
    }

    return null
  }
}

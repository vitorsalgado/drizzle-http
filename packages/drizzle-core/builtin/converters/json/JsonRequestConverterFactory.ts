import { RequestBodyConverter } from '../../../RequestBodyConverter.js'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter.js'
import { Drizzle } from '../../../Drizzle.js'
import { BuiltInConv } from '../../BuiltInConv.js'
import { RequestFactory } from '../../../RequestFactory.js'
import { JsonRequestConverter } from './JsonRequestConverter.js'

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

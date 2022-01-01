import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter'
import { Drizzle } from '../../../Drizzle'
import { BuiltInConv } from '../../BuiltInConv'
import { RequestFactory } from '../../../RequestFactory'
import { JsonRequestConverter } from './JsonRequestConverter'

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

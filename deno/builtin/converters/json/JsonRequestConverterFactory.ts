import { RequestBodyConverter } from '../../../RequestBodyConverter.ts'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { BuiltInConv } from '../../BuiltInConv.ts'
import { RequestFactory } from '../../../RequestFactory.ts'
import { JsonRequestConverter } from './JsonRequestConverter.ts'

export class JsonRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: JsonRequestConverterFactory = new JsonRequestConverterFactory()

  provide(drizzle: Drizzle, requestType: string, requestFactory: RequestFactory): RequestBodyConverter<unknown> | null {
    if (requestType === BuiltInConv.JSON) {
      return JsonRequestConverter.INSTANCE
    }

    return null
  }
}

import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import MediaTypes from '../../../MediaTypes'
import { JsonRequestConverter } from './JsonRequestConverter'

export class JsonRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: JsonRequestConverterFactory = new JsonRequestConverterFactory()

  requestConverter(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): RequestBodyConverter<unknown> | null {
    if (requestFactory.contentTypeContains(MediaTypes.APPLICATION_JSON)) {
      return JsonRequestConverter.INSTANCE
    }

    return null
  }
}

import { RequestConverterFactory } from '../../../../request.body.converter'
import { RequestBodyConverter } from '../../../../request.body.converter'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import MediaTypes from '../../../../http.media.types'
import { JsonRequestConverter } from './JsonRequestConverter'

export class JsonRequestConverterFactory extends RequestConverterFactory {
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

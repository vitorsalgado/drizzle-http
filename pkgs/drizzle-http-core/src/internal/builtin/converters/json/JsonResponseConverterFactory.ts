import { ResponseConverterFactory } from '../../../../response.converter'
import { ResponseConverter } from '../../../../response.converter'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { JsonResponseConverter } from './JsonResponseConverter'
import MediaTypes from '../../../../http.media.types'
import { DzResponse } from '../../../../DzResponse'

export class JsonResponseConverterFactory extends ResponseConverterFactory {
  static INSTANCE: JsonResponseConverterFactory = new JsonResponseConverterFactory()

  responseBodyConverter<T>(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<DzResponse, Promise<T>> | null {
    if (requestFactory.contentTypeContains(MediaTypes.APPLICATION_JSON)) {
      return JsonResponseConverter.INSTANCE
    }

    return null
  }
}

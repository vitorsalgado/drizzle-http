import { RequestFactory } from '../../../../RequestFactory'
import { Drizzle } from '../../../../Drizzle'
import MediaTypes from '../../../../MediaTypes'
import { HttpResponse } from '../../../../HttpResponse'
import { ResponseConverter } from '../../../../ResponseConverter'
import { ResponseConverterFactory } from '../../../../ResponseConverter'
import { JsonResponseConverter } from './JsonResponseConverter'

export class JsonResponseConverterFactory extends ResponseConverterFactory {
  static INSTANCE: JsonResponseConverterFactory = new JsonResponseConverterFactory()

  responseBodyConverter<T>(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<HttpResponse, Promise<T>> | null {
    if (requestFactory.contentTypeContains(MediaTypes.APPLICATION_JSON)) {
      return JsonResponseConverter.INSTANCE
    }

    return null
  }
}
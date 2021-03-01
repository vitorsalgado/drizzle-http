import { RequestBodyConverter, RequestConverterFactory } from '../../../request.body.converter'
import { RequestFactory } from '../../../request.factory'
import { ResponseConverter, ResponseConverterFactory } from '../../../response.converter'
import { Drizzle } from '../../../drizzle'
import { Response } from '../../../response'
import { RequestValues } from '../../../request.values'
import MediaTypes from '../../../http.media.types'

export class JsonRequestConverter implements RequestBodyConverter<string> {
  static INSTANCE: JsonRequestConverter = new JsonRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestValues, value: string): void {
    if (value.constructor === Object || Array.isArray(value)) {
      requestValues.body = JSON.stringify(value)
      return
    }

    requestValues.body = value
  }
}

export class JsonResponseConverter<T> implements ResponseConverter<Response, Promise<T>> {
  static INSTANCE: JsonResponseConverter<unknown> = new JsonResponseConverter<unknown>()

  convert<T>(from: Response): Promise<T> {
    return from.json()
  }
}

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

export class JsonResponseConverterFactory extends ResponseConverterFactory {
  static INSTANCE: JsonResponseConverterFactory = new JsonResponseConverterFactory()

  responseBodyConverter<T>(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<Response, Promise<T>> | null {
    if (requestFactory.contentTypeContains(MediaTypes.APPLICATION_JSON)) {
      return JsonResponseConverter.INSTANCE
    }

    return null
  }
}

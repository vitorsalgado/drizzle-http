import { RequestBodyConverter, RequestConverterFactory } from '../../../../request.body.converter'
import { RequestFactory } from '../../../../request.factory'
import { ResponseConverter, ResponseConverterFactory } from '../../../../response.converter'
import { Drizzle } from '../../../../drizzle'
import { RequestParameterization } from '../../../../request.parameterization'
import MediaTypes from '../../../../http.media.types'
import { DzResponse } from '../../../../DzResponse'

export class JsonRequestConverter implements RequestBodyConverter<string> {
  static INSTANCE: JsonRequestConverter = new JsonRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: string): void {
    if (value.constructor === Object || Array.isArray(value)) {
      requestValues.body = JSON.stringify(value)
      return
    }

    requestValues.body = value
  }
}

export class JsonResponseConverter<T> implements ResponseConverter<DzResponse, Promise<T>> {
  static INSTANCE: JsonResponseConverter<unknown> = new JsonResponseConverter<unknown>()

  convert<T>(from: DzResponse): Promise<T> {
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
  ): ResponseConverter<DzResponse, Promise<T>> | null {
    if (requestFactory.contentTypeContains(MediaTypes.APPLICATION_JSON)) {
      return JsonResponseConverter.INSTANCE
    }

    return null
  }
}

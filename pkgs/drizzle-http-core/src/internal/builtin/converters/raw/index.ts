import { RequestBodyConverter, RequestConverterFactory } from '../../../../request.body.converter'
import { RequestFactory } from '../../../../request.factory'
import { ResponseConverter, ResponseConverterFactory } from '../../../../response.converter'
import { Drizzle } from '../../../../drizzle'
import { BodyType } from '../../../../types'
import { RequestParameterization } from '../../../../request.parameterization'
import { DrizzleMeta } from '../../../../drizzle.meta'
import { DzResponse } from '../../../../DzResponse'

const ReturnIdentifier = 'raw'

/**
 * Use this to return the full response, including status code, headers, unprocessed body.
 * The {@link Response} is similar to Fetch response implementation
 */
export function FullResponse() {
  return function (target: object, method: string) {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
    requestFactory.returnIdentifier = ReturnIdentifier
  }
}

export class RawResponseConverter implements ResponseConverter<DzResponse, Promise<DzResponse>> {
  static INSTANCE: RawResponseConverter = new RawResponseConverter()

  async convert(from: DzResponse): Promise<DzResponse> {
    return from
  }
}

export class RawRequestConverter implements RequestBodyConverter<BodyType> {
  static INSTANCE: RawRequestConverter = new RawRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: BodyType): void {
    requestValues.body = value
  }
}

export class RawRequestConverterFactory extends RequestConverterFactory {
  static INSTANCE: RawRequestConverterFactory = new RawRequestConverterFactory()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestConverter(
    _drizzle: Drizzle,
    _method: string,
    _requestInit: RequestFactory
  ): RequestBodyConverter<unknown> | null {
    return RawRequestConverter.INSTANCE
  }
}

export class RawResponseConverterFactory extends ResponseConverterFactory {
  static INSTANCE: RawResponseConverterFactory = new RawResponseConverterFactory()

  responseBodyConverter(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<DzResponse, Promise<DzResponse>> | null {
    if (requestFactory.isReturnIdentifier(ReturnIdentifier)) {
      return RawResponseConverter.INSTANCE
    }

    return null
  }
}

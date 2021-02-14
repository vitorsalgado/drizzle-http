import { RequestBodyConverter, RequestConverterFactory } from '../../../request.body.converter'
import { RequestFactory } from '../../../request.factory'
import { ResponseConverter, ResponseConverterFactory } from '../../../response.converter'
import { Drizzle } from '../../../drizzle'
import { Response } from '../../../response'
import { BodyType } from '../../../types'
import { RequestValues } from '../../../request.values'
import { DrizzleMeta } from '../../../drizzle.meta'

/**
 * Use this to return the full response, including status code, headers, unprocessed body.
 * The {@link Response} is similar to Fetch response implementation
 */
export function FullResponse() {
  return function (target: any, method: string) {
    const requestFactory = DrizzleMeta.provideRequestFactory(target, method)
    requestFactory.returnGenericType = Response
  }
}

export class RawResponseConverter implements ResponseConverter<Response, Promise<Response>> {
  static INSTANCE: RawResponseConverter = new RawResponseConverter()

  async convert(from: Response): Promise<Response> {
    return from
  }
}

export class RawRequestConverter implements RequestBodyConverter<BodyType> {
  static INSTANCE: RawRequestConverter = new RawRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestValues, value: BodyType): void {
    requestValues.body = value
  }
}

export class RawRequestConverterFactory extends RequestConverterFactory {
  static INSTANCE: RawRequestConverterFactory = new RawRequestConverterFactory()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestConverter(_drizzle: Drizzle, _method: string, _requestInit: RequestFactory): RequestBodyConverter<unknown> | null {
    return RawRequestConverter.INSTANCE
  }
}

export class RawResponseConverterFactory extends ResponseConverterFactory {
  static INSTANCE: RawResponseConverterFactory = new RawResponseConverterFactory()

  responseBodyConverter(_drizzle: Drizzle, _method: string, requestFactory: RequestFactory): ResponseConverter<Response, Promise<Response>> | null {
    // the return V is the internal Response, similar to Fetch API
    if (requestFactory.isGenericReturnTypeOf(Response)) {
      return RawResponseConverter.INSTANCE
      // attempt to check if return handledType is a Fetch Response
    } else if (requestFactory.returnType?.prototype[Symbol.toStringTag] === 'Response') {
      return RawResponseConverter.INSTANCE
    }

    return null
  }
}

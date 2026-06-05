import { RequestFactory } from '../../../request_factory.js'
import { RequestBodyConverter } from '../../../request_body_converter.js'
import { RequestBodyConverterFactory } from '../../../request_body_converter.js'
import { BodyType } from '../../../body_type.js'
import { RequestParameterization } from '../../../request_parameterization.js'
import { Drizzle } from '../../../drizzle.js'

export class RawRequestConverter implements RequestBodyConverter<BodyType> {
  static INSTANCE: RawRequestConverter = new RawRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: BodyType): void {
    requestValues.body = value
  }
}

export class RawRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: RawRequestConverterFactory = new RawRequestConverterFactory()

  provide(_drizzle: Drizzle, _method: string, _requestFactory: RequestFactory): RequestBodyConverter<unknown> | null {
    return RawRequestConverter.INSTANCE
  }
}

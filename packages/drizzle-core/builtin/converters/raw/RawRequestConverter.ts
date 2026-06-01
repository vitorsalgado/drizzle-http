import { RequestFactory } from '../../../RequestFactory.js'
import { RequestBodyConverter } from '../../../RequestBodyConverter.js'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter.js'
import { BodyType } from '../../../BodyType.js'
import { RequestParameterization } from '../../../RequestParameterization.js'
import { Drizzle } from '../../../Drizzle.js'

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

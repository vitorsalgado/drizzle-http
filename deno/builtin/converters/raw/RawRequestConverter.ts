import { RequestFactory } from '../../../RequestFactory.ts'
import { RequestBodyConverter } from '../../../RequestBodyConverter.ts'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter.ts'
import { BodyType } from '../../../BodyType.ts'
import { RequestParameterization } from '../../../RequestParameterization.ts'
import { Drizzle } from '../../../Drizzle.ts'

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

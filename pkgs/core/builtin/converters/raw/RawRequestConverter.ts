import { RequestFactory } from '../../../RequestFactory'
import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { BodyType } from '../../../BodyType'
import { RequestParameterization } from '../../../RequestParameterization'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter'
import { Drizzle } from '../../../Drizzle'

export class RawRequestConverter implements RequestBodyConverter<BodyType> {
  static INSTANCE: RawRequestConverter = new RawRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: BodyType): void {
    requestValues.body = value
  }
}

export class RawRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: RawRequestConverterFactory = new RawRequestConverterFactory()

  provide(_drizzle: Drizzle, _method: string, _requestInit: RequestFactory): RequestBodyConverter<unknown> | null {
    return RawRequestConverter.INSTANCE
  }
}

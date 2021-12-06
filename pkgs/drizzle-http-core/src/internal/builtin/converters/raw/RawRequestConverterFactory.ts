import { RequestBodyConverter } from '../../../../RequestBodyConverter'
import { RequestFactory } from '../../../../RequestFactory'
import { Drizzle } from '../../../../Drizzle'
import { RequestBodyConverterFactory } from '../../../../RequestBodyConverter'
import { RawRequestConverter } from './RawRequestConverter'

export class RawRequestConverterFactory extends RequestBodyConverterFactory {
  static INSTANCE: RawRequestConverterFactory = new RawRequestConverterFactory()

  requestConverter(
    _drizzle: Drizzle,
    _method: string,
    _requestInit: RequestFactory
  ): RequestBodyConverter<unknown> | null {
    return RawRequestConverter.INSTANCE
  }
}

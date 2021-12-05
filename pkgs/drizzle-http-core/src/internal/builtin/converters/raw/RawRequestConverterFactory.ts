import { RequestConverterFactory } from '../../../../request.body.converter'
import { RequestBodyConverter } from '../../../../request.body.converter'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { RawRequestConverter } from './RawRequestConverter'

export class RawRequestConverterFactory extends RequestConverterFactory {
  static INSTANCE: RawRequestConverterFactory = new RawRequestConverterFactory()

  requestConverter(
    _drizzle: Drizzle,
    _method: string,
    _requestInit: RequestFactory
  ): RequestBodyConverter<unknown> | null {
    return RawRequestConverter.INSTANCE
  }
}

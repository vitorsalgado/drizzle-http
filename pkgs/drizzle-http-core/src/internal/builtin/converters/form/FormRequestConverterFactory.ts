import { RequestBodyConverter } from '../../../../RequestBodyConverter'
import { RequestFactory } from '../../../../RequestFactory'
import { Drizzle } from '../../../../Drizzle'
import { RequestBodyConverterFactory } from '../../../../RequestBodyConverter'
import { FormRequestConverter } from './FormRequestConverter'

export class FormRequestConverterFactory extends RequestBodyConverterFactory {
  static INSTANCE: FormRequestConverterFactory = new FormRequestConverterFactory()

  requestConverter(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): RequestBodyConverter<unknown> | null {
    if (requestFactory.isFormUrlEncoded()) {
      return FormRequestConverter.INSTANCE
    }

    return null
  }
}

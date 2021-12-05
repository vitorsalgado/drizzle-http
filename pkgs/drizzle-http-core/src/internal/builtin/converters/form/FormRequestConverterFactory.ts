import { RequestConverterFactory } from '../../../../request.body.converter'
import { RequestBodyConverter } from '../../../../request.body.converter'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { FormRequestConverter } from './FormRequestConverter'

export class FormRequestConverterFactory extends RequestConverterFactory {
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

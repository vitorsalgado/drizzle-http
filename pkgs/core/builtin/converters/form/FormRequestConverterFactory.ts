import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { FormRequestConverter } from './FormRequestConverter'

export class FormRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: FormRequestConverterFactory = new FormRequestConverterFactory()

  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): RequestBodyConverter<unknown> | null {
    if (requestFactory.isFormUrlEncoded()) {
      return FormRequestConverter.INSTANCE
    }

    return null
  }
}

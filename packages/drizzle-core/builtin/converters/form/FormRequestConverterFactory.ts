import { RequestBodyConverter } from '../../../RequestBodyConverter.js'
import { RequestBodyConverterFactory } from '../../../RequestBodyConverter.js'
import { RequestFactory } from '../../../RequestFactory.js'
import { Drizzle } from '../../../Drizzle.js'
import { BuiltInConv } from '../../BuiltInConv.js'
import { FormRequestConverter } from './FormRequestConverter.js'

export class FormRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: FormRequestConverterFactory = new FormRequestConverterFactory()

  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): RequestBodyConverter<unknown> | null {
    if (requestFactory.isFormUrlEncoded() || requestFactory.requestTypeIs(BuiltInConv.FORM_URL_ENCODED)) {
      return FormRequestConverter.INSTANCE
    }

    return null
  }
}

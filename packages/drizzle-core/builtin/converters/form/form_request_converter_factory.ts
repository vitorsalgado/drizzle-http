import { RequestBodyConverter } from '../../../request_body_converter.js'
import { RequestBodyConverterFactory } from '../../../request_body_converter.js'
import { RequestFactory } from '../../../request_factory.js'
import { Drizzle } from '../../../drizzle.js'
import { BuiltInConv } from '../../built_in_conv.js'
import { FormRequestConverter } from './form_request_converter.js'

export class FormRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE: FormRequestConverterFactory = new FormRequestConverterFactory()

  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): RequestBodyConverter<unknown> | null {
    if (requestFactory.isFormUrlEncoded() || requestFactory.requestTypeIs(BuiltInConv.FORM_URL_ENCODED)) {
      return FormRequestConverter.INSTANCE
    }

    return null
  }
}

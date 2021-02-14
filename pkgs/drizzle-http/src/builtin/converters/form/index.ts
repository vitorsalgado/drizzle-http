import { Drizzle } from '../../../drizzle'
import { RequestBodyConverter, RequestConverterFactory } from '../../../request.body.converter'
import { RequestFactory } from '../../../request.factory'
import { encodeFormFieldIfNecessary, RequestBodyTypeNotAllowed } from '../../../internal'
import { RequestValues } from '../../../request.values'
import { MediaTypes } from '../../../http.media.types'

export class FormRequestConverter implements RequestBodyConverter<any> {
  static INSTANCE: FormRequestConverter = new FormRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestValues, value: any): void {
    if (value.constructor === Object) {
      const res: string[] = []

      for (const [prop, v] of Object.entries(value)) {
        if (typeof v === 'string') {
          res.push(prop + '=' + encodeFormFieldIfNecessary(v))
        } else {
          res.push(prop + '=' + String(v))
        }
      }

      requestValues.body = res.join('&')

      return
    } else if (Array.isArray(value) && value.length > 0) {
      if (!Array.isArray(value[0])) {
        throw new RequestBodyTypeNotAllowed(
          requestFactory.method, `${MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8} @Body() arg must be a object, 2d Array or string.`)
      }

      const res: string[] = []

      for (let i = 0; i < value.length; i++) {
        res.push(value[i][0] + '=' + encodeFormFieldIfNecessary(value[i][1]))
      }

      requestValues.body = res.join('&')

      return
    }

    requestValues.body = value
  }
}

export class FormRequestConverterFactory extends RequestConverterFactory {
  static INSTANCE: FormRequestConverterFactory = new FormRequestConverterFactory()

  requestConverter(_drizzle: Drizzle, _method: string, requestFactory: RequestFactory): RequestBodyConverter<unknown> | null {
    if (requestFactory.isFormUrlEncoded()) {
      return FormRequestConverter.INSTANCE
    }

    return null
  }
}

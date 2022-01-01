import { RequestFactory } from '../../../RequestFactory'
import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { BodyType } from '../../../BodyType'
import { MediaTypes } from '../../../MediaTypes'
import { RequestBodyTypeNotAllowedError } from '../../../internal'
import { RequestParameterization } from '../../../RequestParameterization'

export class FormRequestConverter implements RequestBodyConverter<unknown> {
  static INSTANCE: FormRequestConverter = new FormRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: object | Array<string>): void {
    if (value instanceof URLSearchParams) {
      requestValues.body = value.toString()
      return
    } else if (value.constructor === Object) {
      requestValues.body = new URLSearchParams(value as Record<string, string>).toString()
      return
    } else if (Array.isArray(value) && value.length > 0) {
      if (!Array.isArray(value[0])) {
        throw new RequestBodyTypeNotAllowedError(
          requestFactory.method,
          `${MediaTypes.APPLICATION_FORM_URL_ENCODED} @Body() arg must be a object, 2d Array or string.`
        )
      }

      const params = new URLSearchParams()

      for (let i = 0; i < value.length; i++) {
        params.append(value[i][0], value[i][1])
      }

      requestValues.body = params.toString()

      return
    }

    requestValues.body = value as BodyType
  }
}

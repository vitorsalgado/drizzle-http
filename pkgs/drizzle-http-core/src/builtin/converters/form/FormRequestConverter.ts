import { RequestFactory } from '../../../RequestFactory'
import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { BodyType } from '../../../BodyType'
import MediaTypes from '../../../MediaTypes'
import { encodeFormFieldIfNecessary } from '../../../internal/encoding'
import { RequestBodyTypeNotAllowedError } from '../../../internal/errors'
import { RequestParameterization } from '../../../RequestParameterization'

export class FormRequestConverter implements RequestBodyConverter<unknown> {
  static INSTANCE: FormRequestConverter = new FormRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: object | Array<string>): void {
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
        throw new RequestBodyTypeNotAllowedError(
          requestFactory.method,
          `${MediaTypes.APPLICATION_FORM_URL_ENCODED} @Body() arg must be a object, 2d Array or string.`
        )
      }

      const res: string[] = []

      for (let i = 0; i < value.length; i++) {
        res.push(value[i][0] + '=' + encodeFormFieldIfNecessary(value[i][1]))
      }

      requestValues.body = res.join('&')

      return
    }

    requestValues.body = value as BodyType
  }
}

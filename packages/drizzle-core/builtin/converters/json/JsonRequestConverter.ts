import { RequestFactory } from '../../../RequestFactory.js'
import { RequestBodyConverter } from '../../../RequestBodyConverter.js'
import { BodyType } from '../../../BodyType.js'
import { RequestParameterization } from '../../../RequestParameterization.js'

export class JsonRequestConverter implements RequestBodyConverter<string> {
  static INSTANCE: JsonRequestConverter = new JsonRequestConverter()

  convert(
    requestFactory: RequestFactory,
    requestValues: RequestParameterization,
    value: string | object | Array<string>
  ): void {
    if (value.constructor === Object || Array.isArray(value)) {
      requestValues.body = JSON.stringify(value)
      return
    }

    requestValues.body = value as BodyType
  }
}

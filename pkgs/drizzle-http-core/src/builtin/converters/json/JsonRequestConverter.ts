import { RequestFactory } from '../../../RequestFactory'
import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { BodyType } from '../../../BodyType'
import { RequestParameterization } from '../../../RequestParameterization'

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

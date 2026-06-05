import { RequestFactory } from '../../../request_factory.js'
import { RequestBodyConverter } from '../../../request_body_converter.js'
import { BodyType } from '../../../body_type.js'
import { RequestParameterization } from '../../../request_parameterization.js'

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

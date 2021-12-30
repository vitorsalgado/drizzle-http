import { RequestFactory } from '../../../RequestFactory.ts'
import { RequestBodyConverter } from '../../../RequestBodyConverter.ts'
import { BodyType } from '../../../BodyType.ts'
import { RequestParameterization } from '../../../RequestParameterization.ts'

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

import { RequestFactory } from '../../../../request.factory'
import { RequestBodyConverter } from '../../../../request.body.converter'
import { BodyType } from '../../../types'
import { RequestParameterization } from '../../../../request.parameterization'

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

import { RequestFactory } from '../../../../request.factory'
import { RequestBodyConverter } from '../../../../request.body.converter'
import { BodyType } from '../../../types'
import { RequestParameterization } from '../../../../request.parameterization'

export class RawRequestConverter implements RequestBodyConverter<BodyType> {
  static INSTANCE: RawRequestConverter = new RawRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: BodyType): void {
    requestValues.body = value
  }
}

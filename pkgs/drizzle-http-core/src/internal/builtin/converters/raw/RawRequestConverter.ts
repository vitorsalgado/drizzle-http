import { RequestFactory } from '../../../../RequestFactory'
import { RequestBodyConverter } from '../../../../RequestBodyConverter'
import { BodyType } from '../../../types'
import { RequestParameterization } from '../../../../RequestParameterization'

export class RawRequestConverter implements RequestBodyConverter<BodyType> {
  static INSTANCE: RawRequestConverter = new RawRequestConverter()

  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: BodyType): void {
    requestValues.body = value
  }
}

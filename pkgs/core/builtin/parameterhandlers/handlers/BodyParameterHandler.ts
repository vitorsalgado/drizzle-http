import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { Parameter } from '../Parameter'
import { BodyType } from '../../../BodyType'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../RequestParameterization'

export class BodyParameter extends Parameter {
  static Type = 'body'

  constructor(public readonly index: number) {
    super(index, BodyParameter.Type)
  }
}

export class BodyParameterHandler implements ParameterHandler<BodyType> {
  constructor(
    private readonly converter: RequestBodyConverter<BodyType>,
    private readonly requestFactory: RequestFactory
  ) {}

  handle(requestValues: RequestParameterization, value: BodyType): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    this.converter.convert(this.requestFactory, requestValues, value)
  }
}

export class BodyParameterHandlerFactory implements ParameterHandlerFactory<BodyParameter, BodyType> {
  static INSTANCE: BodyParameterHandlerFactory = new BodyParameterHandlerFactory()

  provide(drizzle: Drizzle, requestFactory: RequestFactory, p: BodyParameter): ParameterHandler<BodyType> | null {
    if (p.type !== BodyParameter.Type) {
      return null
    }

    return new BodyParameterHandler(drizzle.requestBodyConverter(requestFactory.method, requestFactory), requestFactory)
  }
}

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

export class BodyParameterHandler implements ParameterHandler<BodyParameter, BodyType> {
  constructor(
    private readonly converter: RequestBodyConverter<BodyType>,
    private readonly requestFactory: RequestFactory,
    readonly parameter: BodyParameter
  ) {}

  apply(requestValues: RequestParameterization, value: BodyType): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    this.converter.convert(this.requestFactory, requestValues, value)
  }
}

export class BodyParameterHandlerFactory implements ParameterHandlerFactory<BodyParameter, BodyType> {
  static INSTANCE: BodyParameterHandlerFactory = new BodyParameterHandlerFactory()

  forType = (): string => BodyParameter.Type

  provide(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
    p: BodyParameter
  ): ParameterHandler<BodyParameter, BodyType> {
    return new BodyParameterHandler(
      drizzle.requestBodyConverter(requestFactory.method, requestFactory),
      requestFactory,
      p
    )
  }
}

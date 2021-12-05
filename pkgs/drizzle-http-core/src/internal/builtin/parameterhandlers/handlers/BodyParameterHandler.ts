import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { RequestBodyConverter } from '../../../../request.body.converter'
import { Parameter } from '../Parameter'
import { BodyType } from '../../../types'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../../request.parameterization'

export const BodyParameterType = 'body'

export class BodyParameter extends Parameter {
  constructor(public readonly index: number) {
    super(index, BodyParameterType)
  }
}

export class BodyParameterHandler extends ParameterHandler<BodyParameter, BodyType> {
  constructor(
    private readonly converter: RequestBodyConverter<BodyType>,
    private readonly requestFactory: RequestFactory,
    parameter: BodyParameter
  ) {
    super(parameter)
  }

  apply(requestValues: RequestParameterization, value: BodyType): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    this.converter.convert(this.requestFactory, requestValues, value)
  }
}

export class BodyParameterHandlerFactory extends ParameterHandlerFactory<BodyParameter, BodyType> {
  static INSTANCE: BodyParameterHandlerFactory = new BodyParameterHandlerFactory()

  handledType = (): string => BodyParameterType

  parameterHandler(
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

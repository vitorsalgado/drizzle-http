import { ParameterHandler } from '../parameter_handler.js'
import { RequestFactory } from '../../../request_factory.js'
import { Drizzle } from '../../../drizzle.js'
import { RequestBodyConverter } from '../../../request_body_converter.js'
import { Parameter } from '../parameter.js'
import { BodyType } from '../../../body_type.js'
import { ParameterHandlerFactory } from '../parameter_handler_factory.js'
import { RequestParameterization } from '../../../request_parameterization.js'

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

    return new BodyParameterHandler(drizzle.requestBodyConverter(requestFactory), requestFactory)
  }
}

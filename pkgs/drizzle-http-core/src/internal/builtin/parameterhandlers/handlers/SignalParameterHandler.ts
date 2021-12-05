import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../../request.parameterization'

export const SignalParameterType = 'signal'

export class SignalParameter extends Parameter {
  constructor(public readonly index: number) {
    super(index, SignalParameterType)
  }
}

export class SignalParameterHandler extends ParameterHandler<SignalParameter, unknown> {
  apply(requestValues: RequestParameterization, value: unknown): void {
    if (value === null || typeof value === 'undefined') {
      throw new TypeError(`Signal parameter must not be null or undefined. (Index: ${this.parameter.index})`)
    }

    requestValues.signal = value
  }
}

export class SignalParameterHandlerFactory extends ParameterHandlerFactory<SignalParameter, unknown> {
  static INSTANCE: SignalParameterHandlerFactory = new SignalParameterHandlerFactory()

  handledType = (): string => SignalParameterType

  parameterHandler(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
    p: SignalParameter
  ): ParameterHandler<SignalParameter, unknown> {
    return new SignalParameterHandler(p)
  }
}

import { ParameterHandler } from '../ParameterHandler.ts'
import { RequestFactory } from '../../../RequestFactory.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { Parameter } from '../Parameter.ts'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory.ts'
import { RequestParameterization } from '../../../RequestParameterization.ts'

export class SignalParameter extends Parameter {
  static Type = 'signal'

  constructor(public readonly index: number) {
    super(index, SignalParameter.Type)
  }
}

export class SignalParameterHandler implements ParameterHandler {
  constructor(readonly parameter: SignalParameter) {}

  handle(requestValues: RequestParameterization, value: unknown): void {
    if (value === null || typeof value === 'undefined') {
      throw new TypeError(`Signal parameter must not be null or undefined. (Index: ${this.parameter.index})`)
    }

    requestValues.signal = value
  }
}

export class SignalParameterHandlerFactory implements ParameterHandlerFactory<SignalParameter, unknown> {
  static INSTANCE: SignalParameterHandlerFactory = new SignalParameterHandlerFactory()

  provide(drizzle: Drizzle, requestFactory: RequestFactory, p: SignalParameter): ParameterHandler | null {
    if (p.type === SignalParameter.Type) {
      return new SignalParameterHandler(p)
    }

    return null
  }
}

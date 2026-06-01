import { ParameterHandler } from '../ParameterHandler.js'
import { RequestFactory } from '../../../RequestFactory.js'
import { Drizzle } from '../../../Drizzle.js'
import { Parameter } from '../Parameter.js'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory.js'
import { RequestParameterization } from '../../../RequestParameterization.js'

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

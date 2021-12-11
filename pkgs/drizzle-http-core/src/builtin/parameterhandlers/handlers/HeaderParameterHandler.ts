import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../RequestParameterization'

export const HeaderParameterType = 'header'

export class HeaderParameter extends Parameter {
  constructor(public readonly key: string, public readonly index: number) {
    super(index, HeaderParameterType)
  }
}

export class HeaderParameterHandler implements ParameterHandler<HeaderParameter, string | string[]> {
  constructor(readonly parameter: HeaderParameter) {}

  apply(requestValues: RequestParameterization, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    if (typeof value === 'string') {
      requestValues.headers.append(this.parameter.key, value)
    } else if (Array.isArray(value)) {
      requestValues.headers.append(this.parameter.key, value.join(','))
    } else {
      requestValues.headers.append(this.parameter.key, String(value))
    }
  }
}

export class HeaderParameterHandlerFactory implements ParameterHandlerFactory<HeaderParameter, string | string[]> {
  static INSTANCE: HeaderParameterHandlerFactory = new HeaderParameterHandlerFactory()

  handledType = (): string => HeaderParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: HeaderParameter
  ): ParameterHandler<HeaderParameter, string | string[]> {
    return new HeaderParameterHandler(p)
  }
}

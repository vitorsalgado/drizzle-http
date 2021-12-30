import { ParameterHandler } from '../ParameterHandler.ts'
import { RequestFactory } from '../../../RequestFactory.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { Parameter } from '../Parameter.ts'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory.ts'
import { RequestParameterization } from '../../../RequestParameterization.ts'

export class HeaderParameter extends Parameter {
  static Type = 'header'

  constructor(public readonly key: string, public readonly index: number) {
    super(index, HeaderParameter.Type)
  }
}

export class HeaderParameterHandler implements ParameterHandler<string | string[]> {
  constructor(readonly parameter: HeaderParameter) {}

  handle(requestValues: RequestParameterization, value: string | string[]): void {
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

  provide(drizzle: Drizzle, rf: RequestFactory, p: HeaderParameter): ParameterHandler<string | string[]> | null {
    if (p.type === HeaderParameter.Type) {
      return new HeaderParameterHandler(p)
    }

    return null
  }
}

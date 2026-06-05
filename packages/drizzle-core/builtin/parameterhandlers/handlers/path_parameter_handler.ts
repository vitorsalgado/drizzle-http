import { ParameterHandler } from '../parameter_handler.js'
import { RequestFactory } from '../../../request_factory.js'
import { Drizzle } from '../../../drizzle.js'
import { Parameter } from '../parameter.js'
import { ParameterHandlerFactory } from '../parameter_handler_factory.js'
import { RequestParameterization } from '../../../request_parameterization.js'
import { encodeIfNecessary } from '../../../internal/index.js'

export class PathParameter extends Parameter {
  static Type = 'path_param'

  constructor(public readonly key: string, public readonly regex: RegExp, public readonly index: number) {
    super(index, PathParameter.Type)
  }
}

export class PathParameterHandler implements ParameterHandler<string | string[]> {
  constructor(readonly parameter: PathParameter) {}

  handle(requestValues: RequestParameterization, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      throw new TypeError(`Path parameter "${this.parameter.key}" must not be null or undefined.`)
    }

    let v: string | string[]

    if (typeof value === 'string') {
      v = value
    } else if (Array.isArray(value)) {
      v = value.join(',')
    } else {
      v = String(value)
    }

    requestValues.path = requestValues.path.replace(this.parameter.regex, encodeIfNecessary(v))
  }
}

export class PathParameterHandlerFactory implements ParameterHandlerFactory<PathParameter, string | string[]> {
  static INSTANCE: PathParameterHandlerFactory = new PathParameterHandlerFactory()

  provide(drizzle: Drizzle, rf: RequestFactory, p: PathParameter): ParameterHandler<string | string[]> | null {
    if (p.type === PathParameter.Type) {
      return new PathParameterHandler(p)
    }

    return null
  }
}

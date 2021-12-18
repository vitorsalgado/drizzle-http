import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../RequestParameterization'
import { encodeIfNecessary } from '../../../internal'

export class PathParameter extends Parameter {
  static Type = 'path_param'

  constructor(public readonly key: string, public readonly regex: RegExp, public readonly index: number) {
    super(index, PathParameter.Type)
  }
}

export class PathParameterHandler implements ParameterHandler<PathParameter, string | string[]> {
  constructor(readonly parameter: PathParameter) {}

  apply(requestValues: RequestParameterization, value: string | string[]): void {
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

  provide(
    drizzle: Drizzle,
    rf: RequestFactory,
    p: PathParameter
  ): ParameterHandler<PathParameter, string | string[]> | null {
    if (p.type === PathParameter.Type) {
      return new PathParameterHandler(p)
    }

    return null
  }
}

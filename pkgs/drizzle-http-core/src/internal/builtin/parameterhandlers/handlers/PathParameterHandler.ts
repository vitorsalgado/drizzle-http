import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../../RequestFactory'
import { Drizzle } from '../../../../Drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../../RequestParameterization'
import { encodeIfNecessary } from '../../../encoding'

export const PathParameterType = 'path_param'

export class PathParameter extends Parameter {
  constructor(public readonly key: string, public readonly regex: RegExp, public readonly index: number) {
    super(index, PathParameterType)
  }
}

export class PathParameterHandler extends ParameterHandler<PathParameter, string | string[]> {
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

export class PathParameterHandlerFactory extends ParameterHandlerFactory<PathParameter, string | string[]> {
  static INSTANCE: PathParameterHandlerFactory = new PathParameterHandlerFactory()

  handledType = (): string => PathParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: PathParameter
  ): ParameterHandler<PathParameter, string | string[]> {
    return new PathParameterHandler(p)
  }
}

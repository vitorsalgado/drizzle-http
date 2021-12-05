import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { encodeIfNecessary } from '../../../encoding'
import { RequestParameterization } from '../../../../request.parameterization'

export const QueryParameterType = 'query'

export class QueryParameter extends Parameter {
  constructor(public readonly key: string, public readonly index: number) {
    super(index, QueryParameterType)
  }
}

export class QueryParameterHandler extends ParameterHandler<QueryParameter, string | string[]> {
  apply(requestValues: RequestParameterization, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    if (typeof value === 'string') {
      requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(value))
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(value[i]))
      }
    } else {
      requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(String(value)))
    }
  }
}

export class QueryParameterHandlerFactory extends ParameterHandlerFactory<QueryParameter, string | string[]> {
  static INSTANCE: QueryParameterHandlerFactory = new QueryParameterHandlerFactory()

  handledType = (): string => QueryParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: QueryParameter
  ): ParameterHandler<QueryParameter, string | string[]> {
    return new QueryParameterHandler(p)
  }
}

import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../RequestParameterization'
import { encodeIfNecessary } from '../../../internal/encoding'

export const QueryNameParameterType = 'query_name'

export class QueryNameParameter extends Parameter {
  constructor(index: number) {
    super(index, QueryNameParameterType)
  }
}

export class QueryNameParameterHandler implements ParameterHandler<QueryNameParameter, string | string[]> {
  constructor(readonly parameter: QueryNameParameter) {}

  apply(requestValues: RequestParameterization, value: string | string[]): void {
    if (typeof value === 'string') {
      requestValues.query.push(encodeIfNecessary(value))
    } else if (Array.isArray(value)) {
      requestValues.query.push(encodeIfNecessary(value.join('&')))
    } else {
      requestValues.query.push(encodeIfNecessary(String(value)))
    }
  }
}

export class QueryNameParameterHandlerFactory
  implements ParameterHandlerFactory<QueryNameParameter, string | string[]>
{
  static INSTANCE: QueryNameParameterHandlerFactory = new QueryNameParameterHandlerFactory()

  handledType = (): string => QueryNameParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: QueryNameParameter
  ): ParameterHandler<QueryNameParameter, string | string[]> {
    return new QueryNameParameterHandler(p)
  }
}
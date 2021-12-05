import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../../request.parameterization'
import { encodeIfNecessary } from '../../../encoding'

export const QueryNameParameterType = 'query_name'

export class QueryNameParameter extends Parameter {
  constructor(index: number) {
    super(index, QueryNameParameterType)
  }
}

export class QueryNameParameterHandler extends ParameterHandler<QueryNameParameter, string | string[]> {
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

export class QueryNameParameterHandlerFactory extends ParameterHandlerFactory<QueryNameParameter, string | string[]> {
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

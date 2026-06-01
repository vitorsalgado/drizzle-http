import { ParameterHandler } from '../ParameterHandler.js'
import { RequestFactory } from '../../../RequestFactory.js'
import { Drizzle } from '../../../Drizzle.js'
import { Parameter } from '../Parameter.js'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory.js'
import { RequestParameterization } from '../../../RequestParameterization.js'
import { encodeIfNecessary } from '../../../internal/index.js'

export class QueryNameParameter extends Parameter {
  static Type = 'query_name'

  constructor(index: number) {
    super(index, QueryNameParameter.Type)
  }
}

export class QueryNameParameterHandler implements ParameterHandler<string | string[]> {
  static INSTANCE: QueryNameParameterHandler = new QueryNameParameterHandler()

  handle(requestValues: RequestParameterization, value: string | string[]): void {
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

  provide(drizzle: Drizzle, rf: RequestFactory, p: QueryNameParameter): ParameterHandler<string | string[]> | null {
    if (p.type === QueryNameParameter.Type) {
      return new QueryNameParameterHandler()
    }

    return null
  }
}

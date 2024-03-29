import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { encodeIfNecessary } from '../../../internal'
import { RequestParameterization } from '../../../RequestParameterization'

export class QueryParameter extends Parameter {
  static Type = 'query'

  constructor(public readonly key: string, public readonly index: number) {
    super(index, QueryParameter.Type)
  }
}

export class QueryParameterHandler implements ParameterHandler<string | string[]> {
  constructor(readonly parameter: QueryParameter) {}

  handle(requestValues: RequestParameterization, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    if (typeof value === 'string') {
      requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(value))
    } else if (Array.isArray(value)) {
      for (const item of value) {
        requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(item))
      }
    } else {
      requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(String(value)))
    }
  }
}

export class QueryParameterHandlerFactory implements ParameterHandlerFactory<QueryParameter, string | string[]> {
  static INSTANCE: QueryParameterHandlerFactory = new QueryParameterHandlerFactory()

  provide(drizzle: Drizzle, rf: RequestFactory, p: QueryParameter): ParameterHandler<string | string[]> | null {
    if (p.type === QueryParameter.Type) {
      return new QueryParameterHandler(p)
    }

    return null
  }
}

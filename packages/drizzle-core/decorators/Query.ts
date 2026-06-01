import { createParameterDecorator } from '../ApiParameterization.js'
import { QueryParameter } from '../builtin/index.js'

/**
 * Query parameter appended to the URL.
 * Target: parameter
 *
 * @param key - query key
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@Header('name') name: string): Promise<Result>
 */
export function Query(key: string) {
  return createParameterDecorator(Query, ctx =>
    ctx.requestFactory.addParameter(new QueryParameter(key, ctx.parameterIndex))
  )
}

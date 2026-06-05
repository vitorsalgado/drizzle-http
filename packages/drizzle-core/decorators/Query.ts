import { QueryParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/api_parameter_spec.js'

/**
 * Query parameter appended to the URL.
 *
 * @param key - query key
 *
 * @example
 *  \@POST('/relative/path')
 *  \@Params([Query('name')])
 *  example(name: string): Promise<Result>
 */
export function Query(key: string): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new QueryParameter(key, ctx.index))
    }
  }
}

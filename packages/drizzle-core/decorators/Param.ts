import { pathParameterRegex } from '../internal/index.js'
import { PathParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/ApiParameterSpec.js'

/**
 * Named replacement for a URL path segment
 *
 * @param key - replacement for a URL segment. If none is provided, the parameter name will be used
 *
 * @example
 *  \@GET('/relative/path/to/\{id\}')
 *  \@Params([Param('id')])
 *  example(id: string): Promise<any>
 */
export function Param(key: string): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new PathParameter(key, pathParameterRegex(key), ctx.index))
    }
  }
}

import { createParameterDecorator } from '../ApiParameterization.ts'
import { pathParameterRegex } from '../internal/index.ts'
import { PathParameter } from '../builtin/index.ts'

/**
 * Named replacement for a URL path segment
 * Target: parameter
 *
 * @param key - replacement for a URL segment. If none is provided, the parameter name will be used
 *
 * @example
 *  \@GET('/relative/path/to/\{id\}')
 *  example(\@Param('id') id: string): Promise<any>
 */
export function Param(key: string) {
  return createParameterDecorator(Param, ctx =>
    ctx.requestFactory.addParameter(new PathParameter(key, pathParameterRegex(key), ctx.parameterIndex))
  )
}

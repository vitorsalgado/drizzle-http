import { setupApiMethod } from '../ApiParameterization'
import { pathParameterRegex } from '../internal'
import { PathParameter } from '../builtin'

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
  return function (target: object, method: string, index: number): void {
    setupApiMethod(target, method, requestFactory => {
      requestFactory.addParameter(new PathParameter(key, pathParameterRegex(key), index))
    })
  }
}

/**
 * Shorthand version of {@link Param} decorator.
 * This decorator will use the method parameter name as the key and will be encoded by default.
 */
export const P = Param

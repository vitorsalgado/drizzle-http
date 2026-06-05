import { HeaderParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/api_parameter_spec.js'

/**
 * Named header to be added to the request.
 *
 * @param key - header key. E.g.: CommonHeaders.CONTENT_TYPE.
 *
 * @example
 *  \@POST('/relative/path')
 *  \@Params([Header('name')])
 *  example(name: string): Promise<Result>
 */
export function Header(key: string): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new HeaderParameter(key, ctx.index))
    }
  }
}

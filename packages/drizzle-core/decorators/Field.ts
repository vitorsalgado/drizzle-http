import { FormParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/api_parameter_spec.js'

/**
 * Named form parameter for a form url-encode request.
 * The request must be decorated with \@FormUrlEncoded
 *
 * @param key - named pair for a form url-encode request
 *
 * @example
 *  \@POST('/relative/path')
 *  \@FormUrlEncoded
 *  \@Params([Field('name'), Field('id')])
 *  example(name: string, id: string): Promise<Result>
 */
export function Field(key: string): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new FormParameter(key, ctx.index))
    }
  }
}

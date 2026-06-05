import { BodyParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/api_parameter_spec.js'

/**
 * Use this spec to mark that a method parameter must be sent as the HTTP Request body
 *
 * @example
 *  \@POST('/relative/path')
 *  \@Params([Body()])
 *  example(data: object): Promise<Result>
 */
export function Body(): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new BodyParameter(ctx.index))
    }
  }
}

import { QueryNameParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/ApiParameterSpec.js'

/**
 * Query parameter appended to the URL that has no value.
 *
 * @example
 *  \@POST('/relative/path')
 *  \@Params([QueryName()])
 *  example(filter: string): Promise<Result>
 *
 * Calling with: example('super+api+test')
 * Results in: /relative/path?super+api+test
 */
export function QueryName(): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new QueryNameParameter(ctx.index))
    }
  }
}

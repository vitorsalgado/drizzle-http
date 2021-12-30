import { createParameterDecorator } from '../ApiParameterization.ts'
import { QueryNameParameter } from '../builtin/index.ts'

/**
 * Query parameter appended to the URL that has no value.
 * Target: parameter
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@QueryName() filter: string): Promise<Result> \{ return theTypes(Promise, Result) \}
 *
 * Calling with: example('super+api+test')
 * Results in: /relative/path?super+api+test
 *
 */
export function QueryName() {
  return createParameterDecorator(QueryName, ctx =>
    ctx.requestFactory.addParameter(new QueryNameParameter(ctx.parameterIndex))
  )
}

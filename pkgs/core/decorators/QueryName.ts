import { createParameterDecorator } from '../ApiParameterization'
import { QueryNameParameter } from '../builtin'

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

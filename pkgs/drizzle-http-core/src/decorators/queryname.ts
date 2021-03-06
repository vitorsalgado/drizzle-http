import { DrizzleMeta } from '../drizzle.meta'
import { QueryNameParameter } from '../request.parameters'

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
  return function QueryName(target: any, method: string, index: number): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.addParameter(new QueryNameParameter(index))
  }
}

/**
 * Short-hand version of {@link QueryName} decorator.
 * The value will be encoded by default.
 */
export const Qn = QueryName

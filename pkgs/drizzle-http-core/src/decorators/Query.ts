import { DrizzleMeta } from '../drizzle.meta'
import { QueryParameter } from '../internal'

/**
 * Query parameter appended to the URL.
 * Target: parameter
 *
 * @param key - query key
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@Header('name') name: string): Promise<Result>
 */
export function Query(key: string) {
  return function (target: object, method: string, index: number): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
    requestFactory.addParameter(new QueryParameter(key, index))
  }
}

/**
 * Shorthand version of {@link Query} decorator.
 * This decorator will use the method parameter name as the key and will be encoded by default.
 */
export const Q = Query

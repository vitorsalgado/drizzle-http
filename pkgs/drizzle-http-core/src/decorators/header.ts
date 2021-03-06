import { DrizzleMeta } from '../drizzle.meta'
import { HeaderParameter } from '../request.parameters'

/**
 * Named header to be added to the request.
 * Target: parameter
 *
 * @param key - header key. Eg.: CommonHeaders.CONTENT_TYPE. If you don't provide the field key, the parameter name will be used.
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@Header('name') name: string): Promise<Result>
 */
export function Header(key: string) {
  return function (target: any, method: string, index: number): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.addParameter(new HeaderParameter(key, index))
  }
}

/**
 * Short-hard version of {@link Header} decorator.
 * This decorator will use the method parameter name as the key.
 */
export const H = Header

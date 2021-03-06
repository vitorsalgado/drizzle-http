import { DrizzleMeta } from '../drizzle.meta'
import { FormParameter } from '../request.parameters'

/**
 * Named form parameter for a form url-encode request.
 * If you don't provide the field key, the parameter name will be used.
 * The request must be decorated with \@FormUrlEncoded
 * Target: parameter
 *
 * @param key - named pair for a form url-encode request
 *
 * @example
 *  \@POST('/relative/path')
 *  \@FormUrlEncoded
 *  example(\@Field('name') name: string, \@Field('id') id: string): Promise<Result>
 */
export function Field(key: string) {
  return function (target: any, method: string, index: number): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.addParameter(new FormParameter(key, index))
  }
}

/**
 * Short-hand version for {@link Field} decorator.
 * This decorator will use the method parameter name as the key and will be encoded by default.
 */
export const F = Field

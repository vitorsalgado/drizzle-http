import { DrizzleMeta } from '../DrizzleMeta'
import { BodyParameter } from '../internal'

/**
 * Use this decorator to mark that a method parameter must be sent as the HTTP Request body
 * Target: parameter
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@Body() data: object): Promise<Result>
 */
export function Body() {
  return function (target: object, method: string, index: number): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
    requestFactory.addParameter(new BodyParameter(index))
  }
}

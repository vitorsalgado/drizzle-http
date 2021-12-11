import { setupApiMethod } from '../ApiParameterization'
import { BodyParameter } from '../builtin'

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
    setupApiMethod(target, method, requestFactory => requestFactory.addParameter(new BodyParameter(index)))
  }
}

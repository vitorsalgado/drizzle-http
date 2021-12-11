import { setupApiMethod } from '../../../ApiParameterization'
import { Keys } from './Keys'

/**
 * Use this to return the full response, including status code, headers, unprocessed body.
 * The {@link Response} is similar to Fetch response implementation
 */
export function FullResponse() {
  return function (target: object, method: string) {
    setupApiMethod(target, method, requestFactory => (requestFactory.returnIdentifier = Keys.ReturnIdentifier))
  }
}

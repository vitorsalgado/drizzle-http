import DrizzleMeta from '../../../../DrizzleMeta'
import { Keys } from './Keys'

/**
 * Use this to return the full response, including status code, headers, unprocessed body.
 * The {@link Response} is similar to Fetch response implementation
 */
export function FullResponse() {
  return function (target: object, method: string) {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
    requestFactory.returnIdentifier = Keys.ReturnIdentifier
  }
}

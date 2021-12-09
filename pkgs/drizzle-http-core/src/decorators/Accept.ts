import { DrizzleMeta } from '../DrizzleMeta'
import { HttpHeaders } from '../HttpHeaders'

/**
 * Set Accept header in the request
 * Target: method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      const requestFactory = DrizzleMeta.provideRequestFactory(target, method)
      requestFactory.defaultHeaders.append(HttpHeaders.ACCEPT, value)
      return
    }

    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata(target)
    apiInstanceMeta.defaultHeaders.append(HttpHeaders.ACCEPT, value)
  }
}

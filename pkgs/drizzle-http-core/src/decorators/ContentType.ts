import { DrizzleMeta } from '../DrizzleMeta'
import { HttpHeaders } from '../HttpHeaders'

/**
 * Set Content-Type header in the request
 * Target: method
 *
 * @param value - content type header value
 */
export function ContentType(value: string) {
  return function <TFunction extends Function>(target: object | TFunction, method?: string) {
    if (method) {
      const requestFactory = DrizzleMeta.provideRequestFactory(target, method)
      requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, value)

      return
    }

    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata(target)
    apiInstanceMeta.defaultHeaders.append(HttpHeaders.CONTENT_TYPE, value)
  }
}

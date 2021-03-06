import { DrizzleMeta } from '../drizzle.meta'
import CommonHeaders from '../http.common.headers'

/**
 * Set Content-Type header in the request
 * Target: method
 *
 * @param value - content type header value
 */
export function ContentType(value: string) {
  return function <TFunction extends Function>(target: any | TFunction, method?: string): any {
    if (method) {
      const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
      requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, value)

      return
    }

    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata(target)
    apiInstanceMeta.defaultHeaders.append(CommonHeaders.CONTENT_TYPE, value)
  }
}

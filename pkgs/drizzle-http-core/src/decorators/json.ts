import { DrizzleMeta } from '../drizzle.meta'
import { MediaTypes } from '../http.media.types'
import CommonHeaders from '../http.common.headers'

/**
 * Makes a request with Content-Type equal to application/json; charset=UTF-8
 * Target: method
 */
export function AsJson() {
  return function <TFunction extends Function>(target: any | TFunction, method?: string): void {
    if (method) {
      DrizzleMeta.provideRequestFactory(target.constructor, method)
        .defaultHeaders.append(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
      return
    }

    DrizzleMeta.provideInstanceMetadata(target)
      .defaultHeaders.append(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON_UTF8)
  }
}

import { DrizzleMeta } from '../drizzle.meta'
import { MediaTypes } from '../http.media.types'
import CommonHeaders from '../http.common.headers'

/**
 * Makes a request with Content-Type equal to application/json; charset=UTF-8
 * Target: method
 */
export function AsJSON() {
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      DrizzleMeta.provideRequestFactory(target.constructor.name, method).defaultHeaders.append(
        CommonHeaders.CONTENT_TYPE,
        MediaTypes.APPLICATION_JSON_UTF8
      )
      return
    }

    DrizzleMeta.provideInstanceMetadata((target as TFunction).name).defaultHeaders.append(
      CommonHeaders.CONTENT_TYPE,
      MediaTypes.APPLICATION_JSON_UTF8
    )
  }
}

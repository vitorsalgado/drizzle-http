import { DrizzleMeta } from '../DrizzleMeta'
import { MediaTypes } from '../MediaTypes'
import { HttpHeaders } from '../HttpHeaders'

/**
 * Makes a request with Content-Type equal to application/json; charset=UTF-8
 * Target: method
 */
export function AsJSON() {
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      DrizzleMeta.provideRequestFactory(target, method).defaultHeaders.append(
        HttpHeaders.CONTENT_TYPE,
        MediaTypes.APPLICATION_JSON
      )
      return
    }

    DrizzleMeta.provideInstanceMetadata(target).defaultHeaders.append(
      HttpHeaders.CONTENT_TYPE,
      MediaTypes.APPLICATION_JSON
    )
  }
}

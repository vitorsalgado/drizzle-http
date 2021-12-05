import { DrizzleMeta } from '../drizzle.meta'
import CommonHeaders from '../http.common.headers'

/**
 * Set Accept header in the request
 * Target: method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
      requestFactory.defaultHeaders.append(CommonHeaders.ACCEPT, value)
      return
    }

    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata((target as TFunction).name)
    apiInstanceMeta.defaultHeaders.append(CommonHeaders.ACCEPT, value)
  }
}

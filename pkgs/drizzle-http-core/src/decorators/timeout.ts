import { DrizzleMeta } from '../drizzle.meta'

/**
 * Set the timeouts for a HTTP request.
 * It assumes that the HTTP client configured supports timeouts for a specific request.
 * Target: method
 *
 * @param readTimeout - timeout value before receiving complete body
 * @param connectTimeout - timeout value before receiving complete params
 */
export function Timeout(readTimeout = 30, connectTimeout = 30) {
  return <TFunction extends Function>(target: any | TFunction, method?: string): void => {
    if (method) {
      const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
      requestFactory.readTimeout = readTimeout
      requestFactory.connectTimeout = connectTimeout
      return
    }

    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata(target)
    apiInstanceMeta.readTimeout = readTimeout
    apiInstanceMeta.connectTimeout = connectTimeout
  }
}

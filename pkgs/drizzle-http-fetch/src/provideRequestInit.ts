import { DrizzleMeta } from '@drizzle-http/core'
import { Keys } from './Keys'

/**
 * Get or create a RequestInit instance associated with an API class and method
 */
export function provideRequestInit(target: object, method: string): RequestInit {
  const requestFactory = DrizzleMeta.provideRequestFactory(target, method)

  let requestInit = requestFactory.getConfig(Keys.ConfigKeyRequestInit) as RequestInit

  if (requestInit) {
    return requestInit
  }

  requestInit = {} as RequestInit

  requestFactory.addConfig(Keys.ConfigKeyRequestInit, requestInit)

  return requestInit
}

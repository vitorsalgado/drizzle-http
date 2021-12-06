import { DrizzleMeta } from '@drizzle-http/core'
import { Keys } from './Keys'

export type FetchInit = RequestInit

/**
 * Get or create a RequestInit instance associated with an API class and method
 */
export function provideRequestInit(target: object, method: string): FetchInit {
  const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)

  let requestInit = requestFactory.getConfig(Keys.ConfigKeyRequestInit) as FetchInit

  if (requestInit) {
    return requestInit
  }

  requestInit = {} as RequestInit

  requestFactory.addConfig(Keys.ConfigKeyRequestInit, requestInit)

  return requestInit
}

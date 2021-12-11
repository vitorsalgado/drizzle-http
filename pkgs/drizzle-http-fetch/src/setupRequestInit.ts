import { getRequestFactoryForMethod } from '@drizzle-http/core'
import { Keys } from './Keys'

/**
 * Get or create a RequestInit instance associated with an API class and method
 */
export function setupRequestInit(target: object, method: string, callback: (requestInit: RequestInit) => void): void {
  const requestFactory = getRequestFactoryForMethod(target, method)
  let requestInit = requestFactory.getConfig(Keys.ConfigKeyRequestInit) as RequestInit

  if (requestInit) {
    return callback(requestInit)
  }

  requestInit = {}

  requestFactory.addConfig(Keys.ConfigKeyRequestInit, requestInit)

  return callback(requestInit)
}

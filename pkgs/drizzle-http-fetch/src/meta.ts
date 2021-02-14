import 'reflect-metadata'
import { DrizzleMeta } from '@drizzle-http/core'

export const ConfigKeyRequestInit = 'drizzle:fetch:request_init'

/**
 * Get or create a RequestInit instance associated with a API class and method
 */
export function provideRequestInit(target: any, method: string): RequestInit {
  const requestFactory = DrizzleMeta.provideRequestFactory(target, method)

  let requestInit = requestFactory.getConfig(ConfigKeyRequestInit) as RequestInit

  if (requestInit) {
    return requestInit
  }

  requestInit = {} as RequestInit

  requestFactory.addConfig(ConfigKeyRequestInit, requestInit)

  return requestInit
}

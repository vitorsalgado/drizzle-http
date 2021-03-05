import { DrizzleMeta } from '@drizzle-http/core'
import { RequestInit as NodeFetchRequestInit } from 'node-fetch'

export const ConfigKeyRequestInit = 'drizzle:fetch:request_init'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface FetchInit extends RequestInit, NodeFetchRequestInit {}

/**
 * Get or create a RequestInit instance associated with a API class and method
 */
export function provideRequestInit(target: any, method: string): FetchInit {
  const requestFactory = DrizzleMeta.provideRequestFactory(target, method)

  let requestInit = requestFactory.getConfig(ConfigKeyRequestInit) as FetchInit

  if (requestInit) {
    return requestInit
  }

  requestInit = {} as RequestInit

  requestFactory.addConfig(ConfigKeyRequestInit, requestInit)

  return requestInit
}

import { DrizzleMeta } from '@drizzle-http/core'
import { Keys } from '../Keys'

export function Fallback(fallback: string | ((...args: never[]) => unknown)) {
  return function (target: object, method: string): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target, method)

    requestFactory.addConfig(Keys.FallbackMethod, fallback)
  }
}

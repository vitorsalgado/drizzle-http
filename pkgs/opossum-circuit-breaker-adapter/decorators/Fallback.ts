import { setupApiMethod } from '@drizzle-http/core'
import { Keys } from '../Keys'

export function Fallback(fallback: string | ((...args: never[]) => unknown)) {
  return function (target: object, method: string): void {
    setupApiMethod(target, method, requestFactory => requestFactory.addConfig(Keys.FallbackMethod, fallback))
  }
}

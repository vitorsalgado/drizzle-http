import { DrizzleMeta } from '@drizzle-http/core'
import CircuitBreaker from 'opossum'
import { Keys } from '../Keys'

export function UseCircuitBreaker(options: CircuitBreaker.Options = {}) {
  return function (target: object, method: string): void {
    const opts = { ...options }

    if (!opts.name) {
      opts.name = method
    }

    const requestFactory = DrizzleMeta.provideRequestFactory(target, method)

    requestFactory.addConfig(Keys.Enabled, true)
    requestFactory.addConfig(Keys.OptionsForMethod, opts)
  }
}

import OpossumCircuitBreaker from 'opossum'
import { setupApiMethod } from '@drizzle-http/core'
import { Keys } from '../Keys'

export function CircuitBreaker(options: OpossumCircuitBreaker.Options = {}) {
  return function (target: object, method: string): void {
    const opts = { ...options }

    if (!opts.name) {
      opts.name = method
    }

    setupApiMethod(target, method, requestFactory => {
      requestFactory.addConfig(Keys.Enabled, true)
      requestFactory.addConfig(Keys.OptionsForMethod, opts)
    })
  }
}

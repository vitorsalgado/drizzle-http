import OpossumCircuitBreaker from 'opossum'
import { createMethodDecorator } from '@drizzle-http/core'
import { Keys } from '../Keys'

export function CircuitBreaker(options: OpossumCircuitBreaker.Options = {}) {
  return createMethodDecorator(CircuitBreaker, ctx => {
    const opts = { ...options }

    if (!opts.name) {
      opts.name = ctx.method
    }

    ctx.requestFactory.addConfig(Keys.OptionsForMethod, opts)
  })
}

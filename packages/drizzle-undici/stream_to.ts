import type { ApiParameterSpec } from '@drizzle-http/core'
import { Internals } from '@drizzle-http/core'
import { Keys } from './keys.js'

export function StreamTo(): ApiParameterSpec {
  return {
    apply(ctx) {
      if (ctx.requestFactory.hasConfig(Keys.StreamTargetIndex)) {
        throw new Internals.InvalidMethodConfigError(
          'Only one parameter can be decorated with @StreamTo().',
          ctx.method
        )
      }

      ctx.requestFactory.addConfig(Keys.StreamTargetIndex, ctx.index)
    }
  }
}

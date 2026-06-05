import type { ApiParameterSpec } from '@drizzle-http/core'
import { Keys } from './keys.js'

export function StreamTo(): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addConfig(Keys.StreamTargetIndex, ctx.index)
    }
  }
}

import type { ApiParameterSpec } from '@drizzle-http/core'
import { Keys } from './Keys.js'

export function StreamTo(): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addConfig(Keys.StreamTargetIndex, ctx.index)
    }
  }
}

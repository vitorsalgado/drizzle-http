import { createParameterDecorator } from '@drizzle-http/core'
import { Keys } from './Keys.js'

export function StreamTo() {
  return createParameterDecorator(StreamTo, ctx =>
    ctx.requestFactory.addConfig(Keys.StreamTargetIndex, ctx.parameterIndex)
  )
}

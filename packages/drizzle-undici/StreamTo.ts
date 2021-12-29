import { createParameterDecorator } from '@drizzle-http/core'
import { Keys } from './Keys'

export function StreamTo() {
  return createParameterDecorator(StreamTo, ctx =>
    ctx.requestFactory.addConfig(Keys.StreamTargetIndex, ctx.parameterIndex)
  )
}

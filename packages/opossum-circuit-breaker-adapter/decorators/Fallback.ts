import { createMethodDecorator } from '@drizzle-http/core'
import { Keys } from '../Keys'

export function Fallback(fallback: string | ((...args: never[]) => unknown)) {
  return createMethodDecorator(Fallback, ctx => ctx.requestFactory.addConfig(Keys.FallbackMethod, fallback))
}

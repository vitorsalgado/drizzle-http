import { createMethodDecorator } from '@drizzle-http/core'

export function Streaming() {
  return createMethodDecorator(Streaming, ctx => {
    ctx.requestFactory.ignoreResponseConverter()
    ctx.requestFactory.ignoreResponseHandler()
  })
}

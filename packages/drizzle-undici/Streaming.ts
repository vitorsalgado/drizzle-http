import { createMethodDecorator } from '@drizzle-http/core'

export function Streaming() {
  return createMethodDecorator(Streaming, ({ requestFactory }) => {
    requestFactory.ignoreResponseConverter()
    requestFactory.ignoreResponseHandler()
  })
}

import { createMethodDecorator } from '@drizzle-http/core'
import { Keys } from './keys.js'
import { resolveStreamingOptions, StreamingOptions } from './streaming_options.js'

export type { StreamingHeadersContext, StreamingOptions } from './streaming_options.js'

export function Streaming(options?: StreamingOptions) {
  return createMethodDecorator(Streaming, ctx => {
    ctx.requestFactory.ignoreResponseConverter()
    ctx.requestFactory.ignoreResponseHandler()
    ctx.requestFactory.markStreamingResponse()
    ctx.requestFactory.addConfig(Keys.StreamingOptions, resolveStreamingOptions(options))
  })
}

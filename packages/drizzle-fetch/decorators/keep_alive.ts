import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function KeepAlive(keepalive: boolean) {
  return createClassAndMethodDecorator(KeepAlive, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(KeepAlive.Key, keepalive)
    } else {
      ctx.defaults.addConfig(KeepAlive.Key, keepalive)
    }
  })
}

KeepAlive.Key = 'fetch:keepalive'

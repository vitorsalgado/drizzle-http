import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Referrer(referrer: string) {
  return createClassAndMethodDecorator(Referrer, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(Referrer.Key, referrer)
    } else {
      ctx.defaults.addConfig(Referrer.Key, referrer)
    }
  })
}

Referrer.Key = 'fetch:referrer'

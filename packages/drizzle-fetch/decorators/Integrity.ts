import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Integrity(integrity: string) {
  return createClassAndMethodDecorator(Integrity, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(Integrity.Key, integrity)
    } else {
      ctx.defaults.addConfig(Integrity.Key, integrity)
    }
  })
}

Integrity.Key = 'fetch:integrity'

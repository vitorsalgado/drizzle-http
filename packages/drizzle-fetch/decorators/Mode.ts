import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Mode(mode: RequestMode) {
  return createClassAndMethodDecorator(Mode, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(Mode.Key, mode)
    } else {
      ctx.defaults.addConfig(Mode.Key, mode)
    }
  })
}

Mode.Key = 'fetch:mode'

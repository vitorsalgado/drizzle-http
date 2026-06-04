import { createClassAndMethodDecorator } from '@drizzle-http/core'
import { Mode } from './Mode.js'

export function CORS() {
  return createClassAndMethodDecorator(CORS, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig<RequestMode>(Mode.Key, 'cors')
    } else {
      ctx.defaults.addConfig<RequestMode>(Mode.Key, 'cors')
    }
  })
}

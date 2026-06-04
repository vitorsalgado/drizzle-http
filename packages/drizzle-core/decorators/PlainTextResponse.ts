import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function PlainTextResponse() {
  return createClassAndMethodDecorator(PlainTextResponse, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.responseType = BuiltInConv.TEXT
    } else {
      ctx.defaults.responseType = BuiltInConv.TEXT
    }
  })
}

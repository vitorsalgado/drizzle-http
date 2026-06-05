import { createClassAndMethodDecorator } from '../api_parameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function PlainTextRequest() {
  return createClassAndMethodDecorator(PlainTextRequest, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.requestType = BuiltInConv.TEXT
    } else {
      ctx.defaults.requestType = BuiltInConv.TEXT
    }
  })
}

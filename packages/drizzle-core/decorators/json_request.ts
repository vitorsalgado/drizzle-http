import { createClassAndMethodDecorator } from '../api_parameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function JsonRequest() {
  return createClassAndMethodDecorator(JsonRequest, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.requestType = BuiltInConv.JSON
    } else {
      ctx.defaults.requestType = BuiltInConv.JSON
    }
  })
}

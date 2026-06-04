import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function JsonResponse() {
  return createClassAndMethodDecorator(JsonResponse, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.responseType = BuiltInConv.JSON
    } else {
      ctx.defaults.responseType = BuiltInConv.JSON
    }
  })
}

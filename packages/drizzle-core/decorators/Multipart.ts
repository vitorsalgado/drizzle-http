import { createClassAndMethodDecorator } from '../api_parameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export const Multipart = () =>
  createClassAndMethodDecorator(Multipart, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.requestType = BuiltInConv.MULTIPART
    } else {
      ctx.defaults.requestType = BuiltInConv.MULTIPART
    }
  })

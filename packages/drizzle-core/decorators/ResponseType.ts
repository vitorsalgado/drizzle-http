import { createClassAndMethodDecorator } from '../ApiParameterization.js'

export function ResponseType(type: string) {
  return createClassAndMethodDecorator(ResponseType, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.responseType = type
    } else {
      ctx.defaults.responseType = type
    }
  })
}

import { createClassAndMethodDecorator } from '../ApiParameterization.js'

export function RequestType(type: string) {
  return createClassAndMethodDecorator(RequestType, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.requestType = type
    } else {
      ctx.defaults.requestType = type
    }
  })
}

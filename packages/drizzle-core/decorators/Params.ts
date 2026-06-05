import { createMethodDecorator } from '../ApiParameterization.js'
import { registerApiMethod } from '../ApiParameterization.js'
import { Callback } from '../builtin/adapters/callback/Callback.js'
import type { ApiParameterSpec } from './params/ApiParameterSpec.js'

export function Params(specs: ApiParameterSpec[]) {
  return createMethodDecorator(Params, ctx => {
    registerApiMethod(ctx.target, ctx.method)

    specs.forEach((spec, index) => {
      spec.apply({
        requestFactory: ctx.requestFactory,
        index,
        method: ctx.method
      })
    })

    let argLen = specs.length

    if (ctx.requestFactory.hasDecorator(Callback)) {
      argLen += 1
    }

    ctx.requestFactory.argLen = argLen
  })
}

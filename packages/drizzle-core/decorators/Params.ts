import { createMethodDecorator } from '../api_parameterization.js'
import { registerApiMethod } from '../api_parameterization.js'
import { Callback } from '../builtin/adapters/callback/callback.js'
import type { ApiParameterSpec } from './params/api_parameter_spec.js'

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

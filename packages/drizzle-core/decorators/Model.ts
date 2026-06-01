import { createParameterDecorator } from '../ApiParameterization.js'
import { ModelParameter } from '../builtin/index.js'
import { Class } from '../internal/index.js'

export function Model(model: Class) {
  return createParameterDecorator(Model, ctx => {
    ctx.requestFactory.skipCheckIfPathParamsAreInSyncWithUrl()
    ctx.requestFactory.addParameter(new ModelParameter(ctx.parameterIndex, ctx.method, model))
  })
}

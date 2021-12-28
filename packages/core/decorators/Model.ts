import { createParameterDecorator } from '../ApiParameterization'
import { ModelParameter } from '../builtin'
import { Class } from '../internal'

export function Model(model: Class) {
  return createParameterDecorator(Model, ctx => {
    ctx.requestFactory.skipCheckIfPathParamsAreInSyncWithUrl()
    ctx.requestFactory.addParameter(new ModelParameter(ctx.parameterIndex, ctx.method, model))
  })
}

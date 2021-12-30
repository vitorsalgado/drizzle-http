import { createParameterDecorator } from '../ApiParameterization.ts'
import { ModelParameter } from '../builtin/index.ts'
import { Class } from '../internal/index.ts'

export function Model(model: Class) {
  return createParameterDecorator(Model, ctx => {
    ctx.requestFactory.skipCheckIfPathParamsAreInSyncWithUrl()
    ctx.requestFactory.addParameter(new ModelParameter(ctx.parameterIndex, ctx.method, model))
  })
}

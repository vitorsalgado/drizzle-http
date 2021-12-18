import { createParameterDecorator } from '../ApiParameterization'
import { ModelArgumentParameter } from '../builtin'
import { Class } from '../internal'

export function Model() {
  return createParameterDecorator(Model, ctx => {
    ctx.requestFactory.skipCheckIfPathParamsAreInSyncWithUrl()
    ctx.requestFactory.addParameter(
      new ModelArgumentParameter(ctx.parameterIndex, ctx.method, ctx.target.constructor as Class)
    )
  })
}

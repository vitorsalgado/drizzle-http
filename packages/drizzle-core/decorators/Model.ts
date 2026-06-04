import { ModelParameter, registerModelMappings } from '../builtin/index.js'
import { Class } from '../internal/index.js'
import type { ApiParameterSpec } from './params/ApiParameterSpec.js'

export function Model(model: Class): ApiParameterSpec {
  return {
    apply(ctx) {
      registerModelMappings(model)
      ctx.requestFactory.skipCheckIfPathParamsAreInSyncWithUrl()
      ctx.requestFactory.addParameter(new ModelParameter(ctx.index, ctx.method, model))
    }
  }
}

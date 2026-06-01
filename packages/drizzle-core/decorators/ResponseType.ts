import { TargetCtor, TargetProto } from '../internal/index.js'
import { setupRequestFactory } from '../ApiParameterization.js'
import { setupApiDefaults } from '../ApiParameterization.js'

export function ResponseType(type: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(ResponseType, target, method, ctx => (ctx.responseType = type))
    }

    setupApiDefaults(ResponseType, target, parameters => (parameters.responseType = type))
  }
}

import { TargetCtor, TargetProto } from '../internal/index.js'
import { setupRequestFactory } from '../ApiParameterization.js'
import { setupApiDefaults } from '../ApiParameterization.js'

export function RequestType(type: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(RequestType, target, method, ctx => (ctx.requestType = type))
    }

    setupApiDefaults(RequestType, target, parameters => (parameters.requestType = type))
  }
}

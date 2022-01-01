import { TargetCtor, TargetProto } from '../internal'
import { setupRequestFactory } from '../ApiParameterization'
import { setupApiDefaults } from '../ApiParameterization'

export function RequestType(type: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(RequestType, target, method, ctx => (ctx.requestType = type))
    }

    setupApiDefaults(RequestType, target, parameters => (parameters.requestType = type))
  }
}

import { TargetCtor, TargetProto } from '../internal'
import { setupRequestFactory } from '../ApiParameterization'
import { setupApiDefaults } from '../ApiParameterization'

export function ResponseType(type: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(ResponseType, target, method, ctx => (ctx.responseType = type))
    }

    setupApiDefaults(ResponseType, target, parameters => (parameters.responseType = type))
  }
}

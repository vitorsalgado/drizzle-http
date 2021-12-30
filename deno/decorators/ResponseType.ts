import { TargetClass } from '../internal/index.ts'
import { setupRequestFactory } from '../ApiParameterization.ts'
import { setupApiDefaults } from '../ApiParameterization.ts'

export function ResponseType(type: string) {
  return function (target: object | TargetClass, method?: string) {
    if (method) {
      return setupRequestFactory(ResponseType, target, method, ctx => (ctx.responseType = type))
    }

    setupApiDefaults(ResponseType, target, parameters => (parameters.responseType = type))
  }
}

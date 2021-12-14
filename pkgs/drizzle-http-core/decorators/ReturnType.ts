import { setupApiMethod } from '../ApiParameterization'
import { Ctor } from '../internal'

export function ReturnType(type: Ctor) {
  return function (target: object, method: string): void {
    return setupApiMethod(target, method, requestFactory => (requestFactory.returnType = type))
  }
}

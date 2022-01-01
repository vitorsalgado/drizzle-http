import { setupRequestFactory } from '../ApiParameterization'
import { setupApiDefaults } from '../ApiParameterization'
import { HttpHeaders } from '../HttpHeaders'
import { TargetCtor, TargetProto } from '../internal'

/**
 * Set Accept header in the request
 * Target: method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(Accept, target, method, requestFactory =>
        requestFactory.defaultHeaders.append(HttpHeaders.ACCEPT, value)
      )
    }

    setupApiDefaults(Accept, target, parameters => parameters.headers.append(HttpHeaders.ACCEPT, value))
  }
}

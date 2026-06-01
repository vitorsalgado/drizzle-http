import { setupRequestFactory } from '../ApiParameterization.js'
import { setupApiDefaults } from '../ApiParameterization.js'
import { HttpHeaders } from '../HttpHeaders.js'
import { TargetCtor, TargetProto } from '../internal/index.js'

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

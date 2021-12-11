import { setupApiMethod } from '../ApiParameterization'
import { setupApiInstance } from '../ApiParameterization'
import { MediaTypes } from '../MediaTypes'
import { HttpHeaders } from '../HttpHeaders'

/**
 * Makes a request with Content-Type equal to application/json; charset=UTF-8
 * Target: method
 */
export function AsJSON() {
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      return setupApiMethod(target, method, requestFactory =>
        requestFactory.defaultHeaders.append(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)
      )
    }

    setupApiInstance(target, parameters =>
      parameters.defaultHeaders.append(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)
    )
  }
}

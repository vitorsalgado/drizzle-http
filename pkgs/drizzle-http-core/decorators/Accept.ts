import { setupApiMethod } from '../ApiParameterization'
import { setupApiInstance } from '../ApiParameterization'
import { HttpHeaders } from '../HttpHeaders'

/**
 * Set Accept header in the request
 * Target: method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      return setupApiMethod(target, method, requestFactory =>
        requestFactory.defaultHeaders.append(HttpHeaders.ACCEPT, value)
      )
    }

    setupApiInstance(target, parameters => parameters.defaultHeaders.append(HttpHeaders.ACCEPT, value))
  }
}

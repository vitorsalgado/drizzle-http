import { setupApiMethod } from '../ApiParameterization'
import { setupApiInstance } from '../ApiParameterization'
import { HttpHeaders } from '../HttpHeaders'

/**
 * Set Content-Type header in the request
 * Target: method
 *
 * @param value - content type header value
 */
export function ContentType(value: string) {
  return function <TFunction extends Function>(target: object | TFunction, method?: string) {
    if (method) {
      return setupApiMethod(target, method, requestFactory =>
        requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, value)
      )
    }

    setupApiInstance(target, parameters => parameters.defaultHeaders.append(HttpHeaders.CONTENT_TYPE, value))
  }
}

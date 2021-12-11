import { setupApiMethod } from '../ApiParameterization'
import { setupApiInstance } from '../ApiParameterization'

/**
 * Set the timeouts for an HTTP request.
 * It assumes that the HTTP client configured supports timeouts for a specific request.
 * Target: method
 *
 * @param readTimeoutInMs - timeout value before receiving complete body - MILLISECONDS
 * @param connectTimeoutInMs - timeout value before receiving complete params - MILLISECONDS
 */
export function Timeout(readTimeoutInMs = 30e3, connectTimeoutInMs = 30e3) {
  return <TFunction extends Function>(target: object | TFunction, method?: string): void => {
    if (method) {
      return setupApiMethod(target, method, requestFactory => {
        requestFactory.readTimeout = readTimeoutInMs
        requestFactory.connectTimeout = connectTimeoutInMs
      })
    }

    setupApiInstance(target, parameters => {
      parameters.readTimeout = readTimeoutInMs
      parameters.connectTimeout = connectTimeoutInMs
    })
  }
}

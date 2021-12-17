import { setupMethodOrParameterDecorator } from '../ApiParameterization'
import { setupClassDecorator } from '../ApiParameterization'
import { HttpHeaders } from '../HttpHeaders'
import { TargetClass } from '../internal'

/**
 * Set Accept header in the request
 * Target: method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return function (target: object | TargetClass, method?: string) {
    if (method) {
      return setupMethodOrParameterDecorator(Accept, target, method, requestFactory =>
        requestFactory.defaultHeaders.append(HttpHeaders.ACCEPT, value)
      )
    }

    setupClassDecorator(Accept, target, parameters => parameters.headers.append(HttpHeaders.ACCEPT, value))
  }
}

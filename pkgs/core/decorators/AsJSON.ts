import { setupMethodOrParameterDecorator } from '../ApiParameterization'
import { setupClassDecorator } from '../ApiParameterization'
import { MediaTypes } from '../MediaTypes'
import { HttpHeaders } from '../HttpHeaders'
import { TargetClass } from '../internal'

/**
 * Makes a request with Content-Type equal to application/json; charset=UTF-8
 * Target: method
 */
export function AsJSON() {
  return function (target: object | TargetClass, method?: string): void {
    if (method) {
      return setupMethodOrParameterDecorator(AsJSON, target, method, requestFactory =>
        requestFactory.defaultHeaders.append(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)
      )
    }

    setupClassDecorator(AsJSON, target, parameters =>
      parameters.headers.append(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_JSON)
    )
  }
}

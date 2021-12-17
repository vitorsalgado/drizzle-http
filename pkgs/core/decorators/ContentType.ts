import { setupMethodOrParameterDecorator } from '../ApiParameterization'
import { setupClassDecorator } from '../ApiParameterization'
import { HttpHeaders } from '../HttpHeaders'
import { TargetClass } from '../internal'

/**
 * Set Content-Type header in the request
 * Target: method
 *
 * @param value - content type header value
 */
export function ContentType(value: string) {
  return function (target: object | TargetClass, method?: string) {
    if (method) {
      return setupMethodOrParameterDecorator(ContentType, target, method, requestFactory =>
        requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, value)
      )
    }

    setupClassDecorator(ContentType, target, parameters => parameters.headers.append(HttpHeaders.CONTENT_TYPE, value))
  }
}

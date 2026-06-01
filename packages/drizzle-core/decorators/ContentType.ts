import { setupRequestFactory } from '../ApiParameterization.js'
import { setupApiDefaults } from '../ApiParameterization.js'
import { HttpHeaders } from '../HttpHeaders.js'
import { TargetCtor, TargetProto } from '../internal/index.js'

/**
 * Set Content-Type header in the request
 * Target: method
 *
 * @param value - content type header value
 */
export function ContentType(value: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(ContentType, target, method, requestFactory =>
        requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, value)
      )
    }

    setupApiDefaults(ContentType, target, parameters => parameters.headers.append(HttpHeaders.CONTENT_TYPE, value))
  }
}

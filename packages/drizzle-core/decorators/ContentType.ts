import { setupRequestFactory } from '../ApiParameterization'
import { setupApiDefaults } from '../ApiParameterization'
import { HttpHeaders } from '../HttpHeaders'
import { TargetCtor, TargetProto } from '../internal'

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

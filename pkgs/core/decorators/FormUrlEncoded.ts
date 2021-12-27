import { setupRequestFactory } from '../ApiParameterization'
import { setupApiDefaults } from '../ApiParameterization'
import { MediaTypes } from '../MediaTypes'
import { HttpHeaders } from '../HttpHeaders'
import { TargetClass } from '../internal'

/**
 * Mark that the request body will use form url-encoding.
 * Form fields should be declared mark method parameters with \@Field decorator.
 * Target: method
 *
 * @example
 *  \@POST('/relative/path')
 *  \@FormUrlEncoded
 *  example(\@Field('name') name: string, \@Field('id') id: string): Promise<Result>
 */
export function FormUrlEncoded() {
  return function (target: object | TargetClass, method?: string): void {
    if (method) {
      return setupRequestFactory(FormUrlEncoded, target, method, requestFactory =>
        requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
      )
    }

    setupApiDefaults(FormUrlEncoded, target, parameters =>
      parameters.headers.append(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
    )
  }
}

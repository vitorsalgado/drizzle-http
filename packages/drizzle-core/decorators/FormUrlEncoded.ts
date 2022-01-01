import { setupApiDefaults, setupRequestFactory } from '../ApiParameterization'
import { MediaTypes } from '../MediaTypes'
import { HttpHeaders } from '../HttpHeaders'
import { TargetCtor, TargetProto } from '../internal'
import { BuiltInConv } from '..'

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
  return function (target: TargetProto | TargetCtor, method?: string): void {
    if (method) {
      return setupRequestFactory(FormUrlEncoded, target, method, requestFactory => {
        requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
        requestFactory.requestType = BuiltInConv.FORM_URL_ENCODED
      })
    }

    setupApiDefaults(FormUrlEncoded, target, parameters => {
      parameters.headers.append(HttpHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
      parameters.requestType = BuiltInConv.FORM_URL_ENCODED
    })
  }
}

/* eslint-disable @typescript-eslint/ban-types */

import { setupRequestFactory } from '../ApiParameterization'
import { setupApiDefaults } from '../ApiParameterization'
import { TargetCtor, TargetProto } from '../internal'

/**
 * Adds fixed params to the request
 * Target: method
 *
 * @param headers - params object dictionary
 *
 * @example
 *  \@POST('/relative/path')
 *  \@HeadersMap(\{ CommonHeaders.CONTENT_TYPE: 'Application/new-content-type' \})
 *  example(\@Header('name') name: string): Promise<Result>
 */
export function HeaderMap(headers: Record<string, string>) {
  return function (target: TargetProto | TargetCtor, method?: string): void {
    if (method) {
      return setupRequestFactory(HeaderMap, target, method, requestFactory => requestFactory.addDefaultHeaders(headers))
    }

    setupApiDefaults(HeaderMap, target, parameters => parameters.headers.mergeObject(headers))
  }
}

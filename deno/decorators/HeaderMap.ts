/* eslint-disable @typescript-eslint/ban-types */

import { setupRequestFactory } from '../ApiParameterization.ts'
import { setupApiDefaults } from '../ApiParameterization.ts'
import { TargetClass } from '../internal/index.ts'

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
  return function (target: object | TargetClass, method?: string): void {
    if (method) {
      return setupRequestFactory(HeaderMap, target, method, requestFactory => requestFactory.addDefaultHeaders(headers))
    }

    setupApiDefaults(HeaderMap, target, parameters => parameters.headers.mergeObject(headers))
  }
}

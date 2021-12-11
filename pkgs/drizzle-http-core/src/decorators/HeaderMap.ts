/* eslint-disable @typescript-eslint/ban-types */

import { setupApiMethod } from '../ApiParameterization'
import { setupApiInstance } from '../ApiParameterization'

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
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      return setupApiMethod(target, method, requestFactory => requestFactory.addDefaultHeaders(headers))
    }

    setupApiInstance(target, parameters => parameters.addDefaultHeaders(headers))
  }
}

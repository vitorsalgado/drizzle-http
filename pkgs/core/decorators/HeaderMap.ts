/* eslint-disable @typescript-eslint/ban-types */

import { setupMethodOrParameterDecorator } from '../ApiParameterization'
import { setupClassDecorator } from '../ApiParameterization'
import { TargetClass } from '../internal'

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
      return setupMethodOrParameterDecorator(HeaderMap, target, method, requestFactory =>
        requestFactory.addDefaultHeaders(headers)
      )
    }

    setupClassDecorator(HeaderMap, target, parameters => parameters.headers.mergeObject(headers))
  }
}

/* eslint-disable @typescript-eslint/ban-types */

import { DrizzleMeta } from '../DrizzleMeta'

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
    // is method decorator
    if (method) {
      const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
      requestFactory.addDefaultHeaders(headers)

      return
    }

    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata((target as TFunction).name)
    apiInstanceMeta.addDefaultHeaders(headers)
  }
}

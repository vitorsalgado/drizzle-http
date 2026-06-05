import { createClassAndMethodDecorator } from '../api_parameterization.js'
import { mergeHeadersObject } from '../headers.js'

/**
 * Adds fixed params to the request
 * Target: class, method
 *
 * @param headers - params object dictionary
 */
export function HeaderMap(headers: Record<string, string>) {
  return createClassAndMethodDecorator(HeaderMap, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addDefaultHeaders(headers)
    } else {
      mergeHeadersObject(ctx.defaults.headers, headers)
    }
  })
}

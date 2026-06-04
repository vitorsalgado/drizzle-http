import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { HttpHeaders } from '../HttpHeaders.js'

/**
 * Set Content-Type header in the request
 * Target: class, method
 *
 * @param value - content type header value
 */
export function ContentType(value: string) {
  return createClassAndMethodDecorator(ContentType, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addDefaultHeader(HttpHeaders.CONTENT_TYPE, value)
    } else {
      ctx.defaults.headers.append(HttpHeaders.CONTENT_TYPE, value)
    }
  })
}

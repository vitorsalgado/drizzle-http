import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { HttpHeaders } from '../HttpHeaders.js'

/**
 * Set Accept header in the request
 * Target: class, method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return createClassAndMethodDecorator(Accept, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.defaultHeaders.append(HttpHeaders.ACCEPT, value)
    } else {
      ctx.defaults.headers.append(HttpHeaders.ACCEPT, value)
    }
  })
}

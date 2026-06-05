import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { CommonHeaders } from '../headers.js'

/**
 * Set Accept header in the request
 * Target: class, method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return createClassAndMethodDecorator(Accept, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.defaultHeaders.append(CommonHeaders.ACCEPT, value)
    } else {
      ctx.defaults.headers.append(CommonHeaders.ACCEPT, value)
    }
  })
}

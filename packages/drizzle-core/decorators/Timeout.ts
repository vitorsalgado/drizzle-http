import { createClassAndMethodDecorator } from '../ApiParameterization.js'

/**
 * Set the timeouts for an HTTP request.
 * Target: class, method
 *
 * @param readTimeoutInMs - timeout value before receiving complete body - MILLISECONDS
 * @param connectTimeoutInMs - timeout value before receiving complete params - MILLISECONDS
 */
export function Timeout(readTimeoutInMs = 30e3, connectTimeoutInMs = 30e3) {
  return createClassAndMethodDecorator(Timeout, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.readTimeout = readTimeoutInMs
      ctx.requestFactory!.connectTimeout = connectTimeoutInMs
    } else {
      ctx.defaults.readTimeout = readTimeoutInMs
      ctx.defaults.connectTimeout = connectTimeoutInMs
    }
  })
}

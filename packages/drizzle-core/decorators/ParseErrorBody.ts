import { createClassAndMethodDecorator } from '../ApiParameterization.js'

/**
 * Define that errors should be parsed with a {@link ResponseConverter} instance.
 * If no errorType is provided, it will use the same response converter as the success response would use.
 *
 * @param errorType - error type that a {@link ResponseConverter} will try to match. defaults to empty to use the same converter from success responses.
 */
export const ParseErrorBody = (errorType = '') =>
  createClassAndMethodDecorator(ParseErrorBody, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.errorType = errorType
    } else {
      ctx.defaults.errorType = errorType
    }
  })

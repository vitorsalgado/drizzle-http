import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function PlainTextResponse() {
  return createClassAndMethodDecorator(
    PlainTextResponse,
    defaults => (defaults.responseType = BuiltInConv.TEXT),
    requestFactory => (requestFactory.responseType = BuiltInConv.TEXT)
  )
}

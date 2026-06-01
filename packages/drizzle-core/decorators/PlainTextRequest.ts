import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function PlainTextRequest() {
  return createClassAndMethodDecorator(
    PlainTextRequest,
    defaults => (defaults.requestType = BuiltInConv.TEXT),
    requestFactory => (requestFactory.requestType = BuiltInConv.TEXT)
  )
}

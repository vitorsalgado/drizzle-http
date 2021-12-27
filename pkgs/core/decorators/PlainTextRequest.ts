import { createClassAndMethodDecorator } from '../ApiParameterization'
import { BuiltInConv } from '../builtin'

export function PlainTextRequest() {
  return createClassAndMethodDecorator(
    PlainTextRequest,
    defaults => (defaults.requestType = BuiltInConv.TEXT),
    requestFactory => (requestFactory.requestType = BuiltInConv.TEXT)
  )
}

import { createClassAndMethodDecorator } from '../ApiParameterization.ts'
import { BuiltInConv } from '../builtin/index.ts'

export function PlainTextRequest() {
  return createClassAndMethodDecorator(
    PlainTextRequest,
    defaults => (defaults.requestType = BuiltInConv.TEXT),
    requestFactory => (requestFactory.requestType = BuiltInConv.TEXT)
  )
}

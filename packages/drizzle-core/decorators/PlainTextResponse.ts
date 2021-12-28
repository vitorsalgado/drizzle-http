import { createClassAndMethodDecorator } from '../ApiParameterization'
import { BuiltInConv } from '../builtin'

export function PlainTextResponse() {
  return createClassAndMethodDecorator(
    PlainTextResponse,
    defaults => (defaults.responseType = BuiltInConv.TEXT),
    requestFactory => (requestFactory.responseType = BuiltInConv.TEXT)
  )
}

import { createClassAndMethodDecorator } from '../ApiParameterization.ts'
import { BuiltInConv } from '../builtin/index.ts'

export function PlainTextResponse() {
  return createClassAndMethodDecorator(
    PlainTextResponse,
    defaults => (defaults.responseType = BuiltInConv.TEXT),
    requestFactory => (requestFactory.responseType = BuiltInConv.TEXT)
  )
}

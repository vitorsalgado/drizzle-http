import { createClassAndMethodDecorator } from '../ApiParameterization'
import { BuiltInConv } from '../builtin'

export function JsonRequest() {
  return createClassAndMethodDecorator(
    JsonRequest,
    defaults => (defaults.requestType = BuiltInConv.JSON),
    requestFactory => (requestFactory.requestType = BuiltInConv.JSON)
  )
}

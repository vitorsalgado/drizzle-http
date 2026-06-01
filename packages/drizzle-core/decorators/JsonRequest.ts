import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function JsonRequest() {
  return createClassAndMethodDecorator(
    JsonRequest,
    defaults => (defaults.requestType = BuiltInConv.JSON),
    requestFactory => (requestFactory.requestType = BuiltInConv.JSON)
  )
}

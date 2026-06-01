import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export function JsonResponse() {
  return createClassAndMethodDecorator(
    JsonResponse,
    defaults => (defaults.responseType = BuiltInConv.JSON),
    requestFactory => (requestFactory.responseType = BuiltInConv.JSON)
  )
}

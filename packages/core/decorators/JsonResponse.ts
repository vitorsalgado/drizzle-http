import { createClassAndMethodDecorator } from '../ApiParameterization'
import { BuiltInConv } from '../builtin'

export function JsonResponse() {
  return createClassAndMethodDecorator(
    JsonResponse,
    defaults => (defaults.responseType = BuiltInConv.JSON),
    requestFactory => (requestFactory.responseType = BuiltInConv.JSON)
  )
}

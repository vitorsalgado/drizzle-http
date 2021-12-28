import { createClassAndMethodDecorator } from '../ApiParameterization'
import { BuiltInConv } from '../builtin'

export const Multipart = () =>
  createClassAndMethodDecorator(
    Multipart,
    defaults => (defaults.requestType = BuiltInConv.MULTIPART),
    requestFactory => (requestFactory.requestType = BuiltInConv.MULTIPART)
  )

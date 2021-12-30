import { createClassAndMethodDecorator } from '../ApiParameterization.ts'
import { BuiltInConv } from '../builtin/index.ts'

export const Multipart = () =>
  createClassAndMethodDecorator(
    Multipart,
    defaults => (defaults.requestType = BuiltInConv.MULTIPART),
    requestFactory => (requestFactory.requestType = BuiltInConv.MULTIPART)
  )

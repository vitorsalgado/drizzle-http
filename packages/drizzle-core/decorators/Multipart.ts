import { createClassAndMethodDecorator } from '../ApiParameterization.js'
import { BuiltInConv } from '../builtin/index.js'

export const Multipart = () =>
  createClassAndMethodDecorator(
    Multipart,
    defaults => (defaults.requestType = BuiltInConv.MULTIPART),
    requestFactory => (requestFactory.requestType = BuiltInConv.MULTIPART)
  )

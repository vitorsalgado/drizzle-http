import { createClassAndMethodDecorator } from '../ApiParameterization'

export const ParseErrorBody = (errorType: string = '') =>
  createClassAndMethodDecorator(
    ParseErrorBody,
    defaults => (defaults.errorType = errorType),
    requestFactory => (requestFactory.errorType = errorType)
  )

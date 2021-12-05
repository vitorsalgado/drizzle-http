import { DrizzleError } from './DrizzleError'

export class NoParameterHandlerFoundForType extends DrizzleError {
  constructor(type: string, method: string, index: number) {
    super(
      `Type "${type}" does not have a parameter handler associated. Check method "${method}", decorated parameter [${index}].`,
      'DRIZZLE_HTTP_ERR_PARAMETER_HANDLER_NOT_FOUND'
    )
    Error.captureStackTrace(this, NoParameterHandlerFoundForType)
    this.name = 'NoParameterHandlerFoundForType'
  }
}

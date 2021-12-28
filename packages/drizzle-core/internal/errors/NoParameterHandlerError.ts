import { DrizzleError } from './DrizzleError'

export class NoParameterHandlerError extends DrizzleError {
  constructor(public readonly type: string, public readonly method: string, public readonly index: number) {
    super(
      `Type "${type}" does not have a parameter handler associated. Check method "${method}", decorated parameter [${index}].`,
      'DZ_ERR_NO_PARAMETER_HANDLER_FOR_TYPE'
    )

    Error.captureStackTrace(this, NoParameterHandlerError)

    this.name = 'NoParameterHandlerFoundForType'
  }
}

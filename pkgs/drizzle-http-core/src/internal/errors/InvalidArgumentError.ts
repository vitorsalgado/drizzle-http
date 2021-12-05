import { DrizzleError } from './DrizzleError'

export class InvalidArgumentError extends DrizzleError {
  constructor(public readonly message: string, public readonly context: string) {
    super(message, 'DRIZZLE_HTTP_ERR_INVALID_ARGUMENT_ERROR')
    Error.captureStackTrace(this, InvalidArgumentError)
    this.name = 'InvalidArgumentError'
  }
}

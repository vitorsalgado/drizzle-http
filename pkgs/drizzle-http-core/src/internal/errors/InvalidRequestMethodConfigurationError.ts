import { DrizzleError } from './DrizzleError'

export class InvalidRequestMethodConfigurationError extends DrizzleError {
  constructor(public method: string, message: string) {
    super(
      `Method "${method === null || typeof method === 'undefined' ? '' : method}" contains invalid configuration(s): ` +
        message,
      'DRIZZLE_HTTP_ERR_INVALID_REQ_METHOD_CONFIG'
    )
    Error.captureStackTrace(this, InvalidRequestMethodConfigurationError)
    this.name = 'InvalidRequestMethodConfigurationError'
  }
}

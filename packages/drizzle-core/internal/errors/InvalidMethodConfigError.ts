import { DrizzleError } from './DrizzleError'

export class InvalidMethodConfigError extends DrizzleError {
  constructor(public readonly method: string, message: string) {
    super(
      `Method "${method === null || typeof method === 'undefined' ? '' : method}" contains invalid configuration(s): ` +
        message,
      'DZ_ERR_INVALID_REQ_METHOD_CONFIG'
    )

    if ('captureStackTrace' in Error) {
      Error.captureStackTrace(this, InvalidMethodConfigError)
    }

    this.name = 'InvalidRequestMethodConfigurationError'
  }
}

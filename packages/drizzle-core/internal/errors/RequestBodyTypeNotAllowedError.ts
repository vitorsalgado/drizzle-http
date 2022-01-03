import { DrizzleError } from './DrizzleError'

export class RequestBodyTypeNotAllowedError extends DrizzleError {
  constructor(public readonly method: string, message: string) {
    super(message, 'DZ_ERR_REQUEST_BODY_TYPE_NOT_ALLOWED')

    if ('captureStackTrace' in Error) {
      Error.captureStackTrace(this, RequestBodyTypeNotAllowedError)
    }

    this.name = 'RequestBodyTypeNotAllowed'
  }
}

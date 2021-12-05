import { DrizzleError } from './DrizzleError'

export class RequestBodyTypeNotAllowed extends DrizzleError {
  constructor(public method: string, message: string) {
    super(message, 'DRIZZLE_HTTP_ERR_REQUEST_BODY_TYPE_NOT_ALLOWED')
    Error.captureStackTrace(this, RequestBodyTypeNotAllowed)
    this.name = 'RequestBodyTypeNotAllowed'
  }
}

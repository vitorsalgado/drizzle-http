import { DrizzleError } from './DrizzleError'

export class MethodNotSupportedError extends DrizzleError {
  constructor(method: string) {
    super(`Method ${method} is not supported by Drizzle ${method}`, 'DRIZZLE_HTTP_ERR_METHOD_NOT_SUPPORTED')
    Error.captureStackTrace(this, MethodNotSupportedError)
    this.name = 'MethodNotSupportedError'
  }
}

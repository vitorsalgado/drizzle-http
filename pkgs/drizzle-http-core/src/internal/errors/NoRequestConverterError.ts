import { DrizzleError } from './DrizzleError'

export class NoRequestConverterError extends DrizzleError {
  constructor(method: string) {
    super(`No Request Converter found for ${method}`, 'DRIZZLE_HTTP_ERR_NO_REQUEST_CONVERTER')
    Error.captureStackTrace(this, NoRequestConverterError)
    this.name = 'NoRequestConverterError'
  }
}
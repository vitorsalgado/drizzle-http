import { DrizzleError } from './drizzle_error.js'

export class NoRequestConverterError extends DrizzleError {
  constructor(method: string) {
    super(`No Request Converter found for ${method}`, 'DZ_ERR_NO_REQUEST_CONVERTER')

    if ('captureStackTrace' in Error) {
      Error.captureStackTrace(this, NoRequestConverterError)
    }

    this.name = 'NoRequestConverterError'
  }
}

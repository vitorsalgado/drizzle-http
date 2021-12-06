import { DrizzleError } from './internal'
import { HttpResponse } from './HttpResponse'

export class HttpError extends DrizzleError {
  constructor(public readonly request: unknown, public readonly response: HttpResponse) {
    super(`Request failed with status code: ${response.status}`, 'DRIZZLE_HTTP_ERR_HTTP')
    Error.captureStackTrace(this, HttpError)
    this.name = 'DrizzleHttpError'
  }
}

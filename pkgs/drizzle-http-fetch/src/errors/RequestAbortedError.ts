import { DrizzleError, HttpRequest } from '@drizzle-http/core'

export class RequestAbortedError extends DrizzleError {
  constructor(public readonly request: HttpRequest, public readonly type: string, public readonly timeout: number) {
    super(`Request aborted either due to a timeout or an abort command.`, 'DRIZZLE_HTTP_ERR_REQUEST_ABORTED')
    Error.captureStackTrace(this, RequestAbortedError)
    this.name = 'RequestAbortedError'
  }
}

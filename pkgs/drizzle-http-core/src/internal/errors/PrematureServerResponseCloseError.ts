import { DrizzleError } from './DrizzleError'

export class PrematureServerResponseCloseError extends DrizzleError {
  constructor() {
    super('Premature server response close', 'DRIZZLE_HTTP_ERR_PREMATURE_RESP_CLOSE')
    Error.captureStackTrace(this, PrematureServerResponseCloseError)
    this.name = 'PrematureServerResponseCloseError'
  }
}

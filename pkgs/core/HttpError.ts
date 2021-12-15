import { DrizzleError } from './internal'
import { HttpResponse } from './HttpResponse'
import { HttpRequest } from './HttpRequest'

export class HttpError extends DrizzleError {
  private readonly status?: number
  private readonly url?: string

  constructor(public readonly request: HttpRequest, public readonly response: HttpResponse) {
    super(`Request failed with status code: ${response.status}`, 'DZ_ERR_HTTP')

    Error.captureStackTrace(this, HttpError)

    this.name = 'DrizzleHttpError'
    this.status = this.response.status
    this.url = this.response.url
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      url: this.url,
      status: this.status,
      stack: this.stack
    }
  }

  toString() {
    return `HttpError{ ${this.message} }`
  }
}

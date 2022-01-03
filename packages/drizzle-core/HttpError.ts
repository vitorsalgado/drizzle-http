import { DrizzleError } from './internal'
import { HttpRequest } from './HttpRequest'
import { HttpHeaders } from './HttpHeaders'

interface Res<B = unknown, H = HttpHeaders> {
  readonly headers: H
  readonly status: number
  readonly statusText: string
  readonly body: B
}

export class HttpError<B = unknown> extends DrizzleError {
  constructor(public readonly request: HttpRequest, public readonly response: Res<B>) {
    super(`Request failed with status code: ${response.status}`, 'DZ_ERR_HTTP')

    if ('captureStackTrace' in Error) {
      Error.captureStackTrace(this, HttpError)
    }

    this.name = 'DzHttpError'
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      url: this.request.url,
      status: this.response.status,
      stack: this.stack
    }
  }

  toString() {
    return `HttpError{ url:${this.request.url}, status: ${this.response.status}, reason: ${this.message} }`
  }
}

import { DrizzleError } from './internal'
import { HttpRequest } from './HttpRequest'
import { HttpHeaders } from './HttpHeaders'

interface Res<B = unknown, H = HttpHeaders> {
  readonly ok: boolean
  readonly headers: H
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly body: B
}

export class HttpError extends DrizzleError {
  constructor(public readonly request: HttpRequest, public readonly response: Res) {
    super(`Request failed with status code: ${response.status}`, 'DZ_ERR_HTTP')

    Error.captureStackTrace(this, HttpError)

    this.name = 'DzHttpError'
  }

  responseBody<T>(): T {
    return this.response.body as T
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      url: this.response.url,
      status: this.response.status,
      stack: this.stack
    }
  }

  toString() {
    return `HttpError{ url:${this.response.url}, status: ${this.response.status}, reason: ${this.message} }`
  }
}

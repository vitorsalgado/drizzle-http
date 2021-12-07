import { DrizzleError } from './internal'
import { HttpResponse } from './HttpResponse'

export class HttpError extends DrizzleError {
  constructor(public readonly request: unknown, public readonly response: HttpResponse) {
    super(`Request failed with status code: ${response.status}`, 'DRIZZLE_ERR_HTTP')

    Error.captureStackTrace(this, HttpError)

    this.name = 'DrizzleHttpError'
  }

  toString(): string {
    return (
      'DrizzleHttpError{\n' +
      ' response{\n' +
      `   url: ${this.response.url}` +
      `   status: ${this.response.status}\n` +
      `   headers: \n     ${Array.from(this.response.headers.entries())
        .map(([name, value]) => `${name}: ${value}\n`)
        .join()}` +
      ' }' +
      '}'
    )
  }
}

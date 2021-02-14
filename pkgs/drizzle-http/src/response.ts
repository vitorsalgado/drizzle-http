import { BodyType } from './types'
import { HttpBody } from './http.body'
import { Request } from './request'
import { DrizzleError } from './internal'
import { Headers } from './http.headers'

export interface ResponseInit {
  headers: Headers | Record<string, string>
  status: number
  statusText?: string
  type?: string
  url: string
  redirected?: boolean
}

export class Response extends HttpBody {
  readonly headers: Headers
  readonly status: number
  readonly statusText?: string
  readonly type: string
  readonly url: string
  readonly redirected: boolean

  constructor(body: BodyType, init: ResponseInit | any = {}) {
    super(body)

    this.status = init.status ?? 200
    this.statusText = init.statusText ?? ''
    this.headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers)
    this.type = init.type ?? 'basic'
    this.url = init.url ?? ''
    this.redirected = init.redirected ?? false
  }

  get ok(): boolean {
    return Response.isOK(this.status)
  }

  clone(): Response {
    if (this.bodyUsed) {
      throw Error('Cannot clone Response when body is already used')
    }

    return new Response(this.body, {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
      url: this.url,
      type: this.type
    })
  }

  get [Symbol.toStringTag](): string {
    return 'Response'
  }

  static error(): Response {
    return new Response(null, { type: 'error' })
  }

  static redirect(url: string, status: number): Response {
    if (!((status >= 301 && status <= 303) || status === 307 || status === 308)) {
      throw RangeError(`Redirect status must be 301, 302, 303, 307, or 308. Found ${status}`)
    }

    return new Response(null, {
      headers: new Headers({ location: new URL(url).toString() }),
      redirected: true,
      status
    })
  }

  // region Custom

  static isOK(statusCode: number): boolean {
    return statusCode >= 200 && statusCode <= 299
  }

  // endregion
}

export class HttpError extends DrizzleError {
  constructor(public readonly request: Request, public readonly response: Response) {
    super(`Request failed with status code: ${response.status}`, 'DRIZZLE_HTTP_ERR_HTTP')
    Error.captureStackTrace(this, HttpError)
    this.name = 'DrizzleHttpError'
  }
}

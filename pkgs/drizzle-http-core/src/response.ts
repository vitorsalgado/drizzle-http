import { BodyType } from './types'
import { HttpBody } from './http.body'
import { DzHeaders } from './http.headers'

export interface ResponseInit {
  headers: DzHeaders | Record<string, string>
  status: number
  statusText?: string
  type?: string
  url: string
  redirected?: boolean
}

export class Response extends HttpBody {
  readonly headers: DzHeaders
  readonly status: number
  readonly statusText?: string
  readonly type: string
  readonly url: string
  readonly redirected: boolean

  constructor(body: BodyType, init: ResponseInit | any = {}) {
    super(body)

    this.status = init.status ?? 200
    this.statusText = init.statusText ?? ''
    this.headers = init.headers instanceof DzHeaders ? init.headers : new DzHeaders(init.headers)
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
      headers: new DzHeaders({ location: new URL(url).toString() }),
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

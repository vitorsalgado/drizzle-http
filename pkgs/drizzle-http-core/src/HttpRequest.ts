import { HttpHeaders } from './HttpHeaders'
import { BodyType } from './internal'

interface HttpRequestInit {
  url: string
  method: string
  headers: HttpHeaders
  body: BodyType
  headersTimeout?: number
  bodyTimeout?: number
  signal: unknown
}

export class HttpRequest {
  public readonly url: string
  public readonly method: string
  public readonly headers: HttpHeaders
  public readonly body: BodyType
  public readonly headersTimeout?: number
  public readonly bodyTimeout?: number
  public readonly signal?: unknown

  constructor(init: HttpRequestInit) {
    this.url = init.url
    this.method = init.method
    this.headers = init.headers
    this.body = init.body
    this.headersTimeout = init.headersTimeout
    this.bodyTimeout = init.bodyTimeout
    this.signal = init.signal
  }
}

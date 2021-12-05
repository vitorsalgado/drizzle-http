import { BodyType } from './types'
import { DzHeaders } from './http.headers'

interface DzRequestInit {
  url: string
  method: string
  headers: DzHeaders
  body: BodyType
  headersTimeout?: number
  bodyTimeout?: number
  signal: unknown
}

export class DzRequest {
  public readonly url: string
  public readonly method: string
  public readonly headers: DzHeaders
  public readonly body: BodyType
  public readonly headersTimeout?: number
  public readonly bodyTimeout?: number
  public readonly signal?: unknown

  constructor(init: DzRequestInit) {
    this.url = init.url
    this.method = init.method
    this.headers = init.headers
    this.body = init.body
    this.headersTimeout = init.headersTimeout
    this.bodyTimeout = init.bodyTimeout
    this.signal = init.signal
  }
}

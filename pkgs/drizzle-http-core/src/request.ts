/**
 * Request
 * @packageDocumentation
 */

import { HttpBody } from './http.body'
import { BodyType } from './types'
import { Headers } from './http.headers'
import { Readable, Stream } from 'stream'

export interface RequestInit {
  url: string
  method: string
  headers: Headers | Record<string, string>
  body: BodyType
  headersTimeout?: number
  bodyTimeout?: number
  signal: any
}

/**
 * Represents an HTTP Request.
 * This implementation is based on Fetch API.
 */
export class Request extends HttpBody {
  url!: string
  method!: string
  headers!: Headers

  // region Internal

  headersTimeout?: number
  bodyTimeout?: number
  signal?: any

  // endregion

  constructor(input: string | Request, init: RequestInit | any = {}) {
    super(init.body)

    if (input instanceof Request) {
      return new Request(input.url, {
        method: input.method,
        headers: input.headers ?? null,
        body: input.body,
        bodyTimeout: input.bodyTimeout,
        headersTimeout: input.headersTimeout,
        signal: input.signal ?? null,
        ...init
      })
    }

    this.method = init.method ?? 'GET'
    this.method = this.method.toUpperCase()

    if (
      (this.method === 'GET' || this.method === 'HEAD' || this.method === 'OPTIONS') &&
      (this.body !== null || typeof this.body === 'undefined')
    ) {
      throw new TypeError('Request with GET/HEAD/OPTIONS cannot have body.')
    }

    this.url = input
    this.headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers)
    this.bodyTimeout = init.bodyTimeout
    this.headersTimeout = init.headersTimeout
    this.signal = init.signal

    if (!this.headers.has('content-length') && !(this.body instanceof Readable) && this.body !== null) {
      this.headers.append('content-length', String(this.body.length))
    }

    if (this.body instanceof Stream) {
      this.headers.set('Transfer-Encoding', 'chunked')
    }

    if (!this.headers.has('accept')) {
      this.headers.set('Accept', '*/*')
    }
  }

  clone(): Request {
    if (this.bodyUsed) {
      throw new Error('Cannot clone Request when body is already used')
    }

    return new Request(this)
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }
}

/**
 * Builds a {@link Request} instance
 */
export interface RequestBuilder {
  toRequest(args: any[]): Request
}

import { DzHeaders } from './http.headers'
import { BodyType } from './types'

interface DzResponseInit<R> {
  original: R
  headers: DzHeaders
  body: BodyType
  status: number
  url: string
}

export abstract class DzResponse<R = unknown, BLOB = unknown, FORM_DATA = unknown> {
  private readonly _original: R
  private readonly _body: BodyType
  readonly headers: DzHeaders
  readonly status: number
  readonly url: string

  protected constructor(init: DzResponseInit<R>) {
    this._original = init.original
    this._body = init.body
    this.headers = init.headers
    this.status = init.status
    this.url = init.url
  }

  get ok(): boolean {
    return DzResponse.isOK(this.status)
  }

  original(): R {
    return this._original
  }

  get body(): BodyType {
    return this._body
  }

  abstract get bodyUsed(): boolean

  abstract arrayBuffer(): Promise<ArrayBuffer>

  abstract json<T>(): Promise<T>

  abstract text(): Promise<string>

  abstract blob(): Promise<BLOB>

  abstract formData(): Promise<FORM_DATA>

  static isOK(statusCode: number): boolean {
    return statusCode >= 200 && statusCode <= 299
  }
}

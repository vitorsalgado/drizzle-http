import { DzHeaders } from './http.headers'
import { BodyType } from './internal'

interface DzResponseInit<R> {
  original: R
  headers: DzHeaders
  body: BodyType
  status: number
  url: string
}

export abstract class DzResponse<R = unknown, BLOB = unknown, FORM_DATA = unknown> {
  readonly headers: DzHeaders
  readonly status: number
  readonly url: string
  private readonly _original: R
  private readonly _body: BodyType

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

  get body(): BodyType {
    return this._body
  }

  abstract get bodyUsed(): boolean

  static isOK(statusCode: number): boolean {
    return statusCode >= 200 && statusCode <= 299
  }

  original(): R {
    return this._original
  }

  abstract arrayBuffer(): Promise<ArrayBuffer>

  abstract json<T>(): Promise<T>

  abstract text(): Promise<string>

  abstract blob(): Promise<BLOB>

  abstract formData(): Promise<FORM_DATA>
}

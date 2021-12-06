import { HttpHeaders } from './HttpHeaders'
import { BodyType } from './internal'

interface HttpResponseInit<R> {
  original: R
  headers: HttpHeaders
  body: BodyType
  status: number
  url: string
}

export abstract class HttpResponse<R = unknown, BLOB = unknown, FORM_DATA = unknown> {
  readonly headers: HttpHeaders
  readonly status: number
  readonly url: string
  private readonly _original: R
  private readonly _body: BodyType

  protected constructor(init: HttpResponseInit<R>) {
    this._original = init.original
    this._body = init.body
    this.headers = init.headers
    this.status = init.status
    this.url = init.url
  }

  get ok(): boolean {
    return HttpResponse.isOK(this.status)
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

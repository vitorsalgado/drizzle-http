import { Blob } from 'buffer'
import { Readable } from 'stream'
import { HttpHeaders, HttpResponse, isOK } from '@drizzle-http/core'
import { Dispatcher } from 'undici'

export class UndiciResponse implements HttpResponse<Readable & Dispatcher.BodyMixin, Blob, never> {
  readonly body: Readable & Dispatcher.BodyMixin
  readonly headers: HttpHeaders
  readonly trailers: Promise<HttpHeaders>
  readonly status: number
  readonly statusText: string
  readonly url: string

  constructor(url: string, private readonly response: Dispatcher.ResponseData) {
    this.body = response.body
    this.headers = new HttpHeaders(response.headers as Record<string, string>)
    this.trailers = Promise.resolve(new HttpHeaders(response.trailers))
    this.status = response.statusCode
    this.statusText = ''
    this.url = url
  }

  get ok(): boolean {
    return isOK(this.status)
  }

  get bodyUsed(): boolean {
    return this.response.body.bodyUsed
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.response.body.arrayBuffer()
  }

  blob(): Promise<Blob> {
    return this.response.body.blob()
  }

  formData(): Promise<never> {
    return this.response.body.formData()
  }

  json<T>(): Promise<T> {
    return this.response.body.json()
  }

  text(): Promise<string> {
    return this.response.body.text()
  }
}

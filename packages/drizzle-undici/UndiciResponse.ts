import { Blob } from 'buffer'
import { Readable } from 'stream'
import { headersFromRecord, HttpResponse, isOK } from '@drizzle-http/core'
import { Dispatcher } from 'undici'

export class UndiciResponse implements HttpResponse<Readable & Dispatcher.BodyMixin, Blob, never> {
  readonly body: Readable & Dispatcher.BodyMixin
  readonly headers: Headers
  readonly trailers: Promise<Headers>
  readonly status: number
  readonly statusText: string
  readonly url: string

  constructor(url: string, private readonly response: Dispatcher.ResponseData) {
    this.body = response.body
    this.headers = headersFromRecord(response.headers)
    this.trailers = Promise.resolve(headersFromRecord(response.trailers))
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

import { IncomingHttpHeaders } from 'http'
import { Blob } from 'buffer'
import { BodyType } from '@drizzle-http/core'
import { headersFromRecord } from '@drizzle-http/core'
import { isOK } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'

interface StreamingResponseInit {
  readonly headers: IncomingHttpHeaders
  readonly trailers: IncomingHttpHeaders
  readonly status: number
  readonly statusText: string
  readonly url: string
}

export class StreamingResponse implements HttpResponse<BodyType, Blob, never> {
  readonly body: BodyType
  readonly headers: Headers
  readonly trailers: Promise<Headers>
  readonly status: number
  readonly statusText: string
  readonly url: string

  constructor(url: string, private readonly init: StreamingResponseInit) {
    this.body = null
    this.headers = headersFromRecord(init.headers)
    this.trailers = Promise.resolve(headersFromRecord(init.trailers))
    this.status = init.status
    this.statusText = ''
    this.url = url
  }

  get ok(): boolean {
    return isOK(this.status)
  }

  get bodyUsed(): boolean {
    return true
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    throw new TypeError('.arrayBuffer() is not applicable')
  }

  blob(): Promise<Blob> {
    throw new TypeError('.blob() is not applicable')
  }

  formData(): Promise<never> {
    throw new TypeError('.formData() is not applicable')
  }

  json<T>(): Promise<T> {
    throw new TypeError('.json() is not applicable')
  }

  text(): Promise<string> {
    throw new TypeError('.text() is not applicable')
  }
}

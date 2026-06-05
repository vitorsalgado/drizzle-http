import { IncomingHttpHeaders } from 'http'
import { headersFromRecord, HttpResponse, isOK } from '@drizzle-http/core'

export interface StreamingCompletion {
  readonly trailers: Headers
}

export interface StreamingResponseInit {
  readonly headers: IncomingHttpHeaders
  readonly status: number
  readonly statusText: string
}

export class StreamingResponse implements HttpResponse<null, never, never> {
  readonly body: null = null
  readonly headers: Headers
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly completed: Promise<StreamingCompletion>

  constructor(url: string, init: StreamingResponseInit, completed: Promise<StreamingCompletion>) {
    this.headers = headersFromRecord(init.headers)
    this.status = init.status
    this.statusText = init.statusText
    this.url = url
    this.completed = completed
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

  blob(): Promise<never> {
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

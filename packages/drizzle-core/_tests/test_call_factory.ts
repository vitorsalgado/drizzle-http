import { Blob } from 'buffer'
import { Readable } from 'stream'
import { Dispatcher, request as Request } from 'undici'
import { RequestOptions } from 'undici'
import { HttpRequest } from '../http_request.js'
import { Call, CallFactory } from '../call.js'
import { headersFromRecord, headersToRecord } from '../headers.js'
import { Drizzle } from '../drizzle.js'
import { HttpResponse, isOK } from '../http_response.js'
import { isAbsolute } from '../internal/index.js'
import { HttpMethod } from '../decorators/utils/index.js'

class TestCall implements Call<HttpResponse<Readable>> {
  constructor(readonly baseUrl: URL) {}

  async execute(request: HttpRequest): Promise<HttpResponse<Readable>> {
    const url = !isAbsolute(request.url) ? new URL(request.url, this.baseUrl.href).href : request.url

    const res = await Request(url, {
      ...toRequest(url, request),
      path: undefined as unknown as string
    } as RequestOptions)
    return new TestDzResponse(url, res)
  }
}

export class TestCallFactory implements CallFactory {
  static INSTANCE: TestCallFactory = new TestCallFactory()

  setup(_drizzle: Drizzle): void {
    // no setup
  }

  provide(drizzle: Drizzle): Call<unknown> {
    return new TestCall(new URL(drizzle.baseUrl()))
  }
}

function toRequest(url: string, request: HttpRequest): RequestOptions {
  return {
    path: url,
    method: request.method as HttpMethod,
    body: request.body,
    headers: headersToRecord(request.headers),
    bodyTimeout: request.bodyTimeout,
    headersTimeout: request.headersTimeout,
    signal: request.signal
  }
}

class TestDzResponse implements HttpResponse<Readable | null, Blob, never> {
  readonly body: Readable
  readonly headers: Headers
  readonly trailers?: Promise<Headers>
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

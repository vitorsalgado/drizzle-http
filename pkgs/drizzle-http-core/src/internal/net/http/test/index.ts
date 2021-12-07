import { Blob } from 'buffer'
import { request } from 'undici'
import { Dispatcher } from 'undici'
import { RequestOptions } from 'undici/types/dispatcher'
import { HttpMethod } from 'undici/types/dispatcher'
import { Call, CallProvider } from '../../../../Call'
import { CallFactory } from '../../../../Call'
import { RequestFactory } from '../../../../RequestFactory'
import { Drizzle } from '../../../../Drizzle'
import { HttpError } from '../../../../HttpError'
import { HttpRequest } from '../../../../HttpRequest'
import { HttpResponse } from '../../../../HttpResponse'
import { isOK } from '../../../../HttpResponse'
import { isAbsolute } from '../../url'
import { BodyType } from '../../../types'
import { HttpHeaders } from '../../../../HttpHeaders'

class TestCall implements Call<Promise<HttpResponse>> {
  private readonly url: string

  constructor(readonly baseUrl: URL, readonly request: HttpRequest, readonly argv: unknown[]) {
    if (!isAbsolute(this.request.url)) {
      this.url = new URL(request.url, baseUrl.href).href
    } else {
      this.url = request.url
    }
  }

  async execute(): Promise<HttpResponse> {
    const res = await request(this.url, {
      ...toRequest(this.url, this.request),
      path: undefined as unknown as string
    } as RequestOptions)

    if (isOK(res.statusCode)) {
      return new TestDzResponse(this.url, res)
    }

    if (res.body) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const chunk of res.body) {
        // forcing body consumption
      }
    }

    throw new HttpError(this.request, new TestDzResponse(this.url, res))
  }
}

export class TestCallFactory implements CallFactory {
  static INSTANCE: TestCallFactory = new TestCallFactory()

  prepareCall(drizzle: Drizzle, _method: string, _requestFactory: RequestFactory): CallProvider {
    return function (request, args) {
      return new TestCall(new URL(drizzle.baseUrl), request, args)
    }
  }
}

export function toRequest(url: string, request: HttpRequest): RequestOptions {
  return {
    path: url,
    method: request.method as HttpMethod,
    body: request.body,
    headers: request.headers.toObject(),
    bodyTimeout: request.bodyTimeout,
    headersTimeout: request.headersTimeout,
    signal: request.signal
  }
}

class TestDzResponse implements HttpResponse<Blob, never> {
  readonly body: BodyType
  readonly headers: HttpHeaders
  readonly status: number
  readonly statusText: string
  readonly url: string

  constructor(url: string, private readonly response: Dispatcher.ResponseData) {
    this.body = response.body
    this.headers = new HttpHeaders(response.headers as Record<string, string>)
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

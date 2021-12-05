import { request } from 'undici'
import { Dispatcher } from 'undici'
import { RequestOptions } from 'undici/types/dispatcher'
import { HttpMethod } from 'undici/types/dispatcher'
import { Call, CallFactory, CallProvider } from '../../../call'
import { RequestFactory } from '../../../request.factory'
import { Drizzle } from '../../../drizzle'
import { isAbsolute } from '../../url.utils'
import { HttpError } from '../../../http.error'
import { DzRequest } from '../../../DzRequest'
import { DzResponse } from '../../../DzResponse'
import { DzHeaders } from '../../../http.headers'

export class NoopCallFactory implements CallFactory {
  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup(drizzle: Drizzle): void {}
}

class TestCall extends Call<Promise<DzResponse>> {
  private readonly url: string

  constructor(readonly baseUrl: URL, public readonly request: DzRequest, public readonly argv: unknown[]) {
    super(request, argv)

    if (!isAbsolute(this.request.url)) {
      this.url = new URL(request.url, baseUrl.href).href
    } else {
      this.url = request.url
    }
  }

  async execute(): Promise<DzResponse> {
    return request(this.url, {
      ...toRequest(this.url, this.request),
      path: undefined
    } as any).then(res => {
      if (TestDzResponse.isOK(res.statusCode)) {
        return new TestDzResponse(this.url, res)
      }

      throw new HttpError(this.request, new TestDzResponse(this.url, res))
    })
  }
}

export class TestCallFactory implements CallFactory {
  static INSTANCE: TestCallFactory = new TestCallFactory()

  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    return function (request, args) {
      return new TestCall(new URL(drizzle.baseUrl), request, args)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  setup(_drizzle: Drizzle): void {}
}

export function toRequest(url: string, request: DzRequest): RequestOptions {
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

class TestDzResponse extends DzResponse<Dispatcher.ResponseData> {
  constructor(url: string, response: Dispatcher.ResponseData) {
    super({
      url: url,
      headers: new DzHeaders(response.headers as Record<string, string>),
      body: response.body,
      status: response.statusCode,
      original: response
    })
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.original().body.arrayBuffer()
  }

  blob(): Promise<unknown> {
    return this.original().body.blob()
  }

  get bodyUsed(): boolean {
    return this.original().body.bodyUsed
  }

  formData(): Promise<unknown> {
    return this.original().body.formData()
  }

  json<T>(): Promise<T> {
    return this.original().body.json()
  }

  text(): Promise<string> {
    return this.original().body.text()
  }
}

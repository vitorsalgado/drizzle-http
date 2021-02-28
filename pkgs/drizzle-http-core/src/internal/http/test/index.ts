import { Call, CallFactory, CallProvider } from '../../../call'
import { RequestFactory } from '../../../request.factory'
import { Drizzle } from '../../../drizzle'
import { ResponseConverter } from '../../../response.converter'
import { HttpError, Response } from '../../../response'
import { Request } from '../../../request'
import { request } from 'undici'
import { RequestOptions } from 'undici/types/client'
import { isAbsolute } from '../../url.utils'
import { Headers } from '../../../http.headers'

class TestCall<T> extends Call<Promise<T>> {
  constructor(
    readonly url: URL,
    private responseConverter: ResponseConverter<Response, T>,
    public readonly request: Request, public readonly argv: any[]) {
    super(request, argv)

    if (!isAbsolute(this.request.url)) {
      this.request.url = new URL(request.url, url.href).href
    }
  }

  async execute(): Promise<T> {
    return request(this.request.url, { ...toRequest(this.request), path: undefined } as any)
      .then(res => {
        if (Response.isOK(res.statusCode)) {
          return this.responseConverter.convert(
            new Response(res.body, {
              status: res.statusCode,
              headers: new Headers(res.headers as Record<string, string>),
              url: this.request.url
            }))
        }

        throw new HttpError(
          this.request,
          new Response(res.body, {
            status: res.statusCode,
            headers: new Headers(res.headers as Record<string, string>),
            url: this.request.url
          }))
      })
  }
}

export class TestCallFactory implements CallFactory {
  static INSTANCE: TestCallFactory = new TestCallFactory()

  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    return function (request, args) {
      return new TestCall(new URL(drizzle.baseUrl), drizzle.responseBodyConverter(method, requestFactory), request, args)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  setup(_drizzle: Drizzle): void {
  }
}

export function toRequest(request: Request): RequestOptions {
  return {
    path: request.url,
    method: request.method,
    body: request.body,
    headers: request.headers.toObject(),
    bodyTimeout: request.bodyTimeout,
    headersTimeout: request.headersTimeout,
    signal: request.signal
  }
}

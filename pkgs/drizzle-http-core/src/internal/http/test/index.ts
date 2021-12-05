import { request } from 'undici'
import { RequestOptions } from 'undici/types/dispatcher'
import { HttpMethod } from 'undici/types/dispatcher'
import { Call, CallFactory, CallProvider } from '../../../call'
import { RequestFactory } from '../../../request.factory'
import { Drizzle } from '../../../drizzle'
import { Response } from '../../../response'
import { isAbsolute } from '../../url.utils'
import { DzHeaders } from '../../../http.headers'
import { HttpError } from '../../../http.error'
import { DzRequest } from '../../../DzRequest'

export class NoopCallFactory implements CallFactory {
  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup(drizzle: Drizzle): void {}
}

class TestCall extends Call<Promise<Response>> {
  private readonly url: string

  constructor(readonly baseUrl: URL, public readonly request: DzRequest, public readonly argv: any[]) {
    super(request, argv)

    if (!isAbsolute(this.request.url)) {
      this.url = new URL(request.url, baseUrl.href).href
    } else {
      this.url = request.url
    }
  }

  async execute(): Promise<Response> {
    return request(this.url, {
      ...toRequest(this.url, this.request),
      path: undefined
    } as any).then(res => {
      if (Response.isOK(res.statusCode)) {
        return new Response(res.body, {
          status: res.statusCode,
          headers: new DzHeaders(res.headers as Record<string, string>),
          url: this.url
        })
      }

      throw new HttpError(
        this.request,
        new Response(res.body, {
          status: res.statusCode,
          headers: new DzHeaders(res.headers as Record<string, string>),
          url: this.url
        })
      )
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

import { request } from 'undici'
import { Call, CallFactory, CallProvider } from '../../../call'
import { RequestFactory } from '../../../request.factory'
import { Drizzle } from '../../../drizzle'
import { HttpError, Response } from '../../../response'
import { Request } from '../../../request'
import { isAbsolute } from '../../url.utils'
import { Headers } from '../../../http.headers'

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
  constructor(readonly url: URL, public readonly request: Request, public readonly argv: any[]) {
    super(request, argv)

    if (!isAbsolute(this.request.url)) {
      this.request.url = new URL(request.url, url.href).href
    }
  }

  async execute(): Promise<Response> {
    return request(this.request.url, {
      ...toRequest(this.request),
      path: undefined
    } as any).then(res => {
      if (Response.isOK(res.statusCode)) {
        return new Response(res.body, {
          status: res.statusCode,
          headers: new Headers(res.headers as Record<string, string>),
          url: this.request.url
        })
      }

      throw new HttpError(
        this.request,
        new Response(res.body, {
          status: res.statusCode,
          headers: new Headers(res.headers as Record<string, string>),
          url: this.request.url
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

export function toRequest(request: Request): any {
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

import { Call, HttpError, isAbsolute, Request, Response, ResponseConverter } from '@drizzle-http/core'
import NodeFetch from 'node-fetch'

export class FetchCall<T> extends Call<Promise<T>> {
  constructor(
    private readonly url: URL,
    private readonly requestInit: RequestInit,
    private readonly responseConverter: ResponseConverter<Response, T>,
    request: Request,
    argv: any[]
  ) {
    super(request, argv)

    if (!globalThis.fetch) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      globalThis.fetch = NodeFetch
    }

    if (!isAbsolute(request.url)) {
      request.url = new URL(request.url, url).href
    }
  }

  execute(): Promise<T> {
    return fetch(this.request.url, FetchCall.requestInit(this.requestInit, this.request))
      .then(response => {
        if (response.ok) {
          return this.responseConverter.convert(response as any)
        }

        throw new HttpError(this.request, response as any)
      })
  }

  static requestInit(requestInit: RequestInit, request: Request): RequestInit {
    return {
      ...requestInit,
      method: request.method,
      headers: (request.headers as unknown) as Headers,
      body: request.body as BodyInit,
      signal: request.signal
    }
  }
}

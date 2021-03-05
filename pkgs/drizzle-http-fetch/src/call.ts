import { Call, HttpError, isAbsolute, Request, Response, ResponseConverter } from '@drizzle-http/core'
import NodeFetch from 'node-fetch'
import { FetchInit } from './meta'

export class FetchCall<T> extends Call<Promise<T>> {
  constructor(
    private readonly url: URL,
    private readonly requestInit: RequestInit,
    private readonly responseConverter: ResponseConverter<Response, T>,
    private readonly options: FetchInit,
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
    return fetch(this.request.url, FetchCall.requestInit(this.requestInit, this.options, this.request)).then(
      response => {
        if (response.ok) {
          return this.responseConverter.convert(response as any)
        }

        throw new HttpError(this.request, response as any)
      }
    )
  }

  static requestInit(requestInit: RequestInit, options: FetchInit, request: Request): FetchInit {
    return {
      ...options,
      ...requestInit,
      method: request.method,
      headers: (request.headers as unknown) as Headers,
      body: request.body as BodyInit,
      signal: request.signal
    }
  }
}

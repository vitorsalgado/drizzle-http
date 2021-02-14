import { Call, isAbsolute, Request, Response, ResponseConverter } from '@drizzle-http/core'

export class FetchCall<T> extends Call<Promise<T>> {
  constructor(
    private readonly url: URL,
    private readonly requestInit: RequestInit,
    private readonly responseConverter: ResponseConverter<Response, T>,
    request: Request,
    argv: any[]
  ) {
    super(request, argv)

    if (!isAbsolute(request.url)) {
      request.url = new URL(request.url, url).href
    }
  }

  execute(): Promise<T> {
    return fetch(this.request.url, FetchCall.requestInit(this.requestInit, this.request))
      .then(response => this.responseConverter.convert(response as any))
  }

  static requestInit(requestInit: RequestInit, request: Request): RequestInit {
    return {
      ...requestInit,
      method: request.method,
      headers: request.headers as unknown as Headers,
      body: request.body as BodyInit
    }
  }
}

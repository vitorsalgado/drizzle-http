import { Call, HttpRequest, Internals } from '@drizzle-http/core'

export class FetchCall implements Call<Response> {
  private readonly url: string

  constructor(
    baseUrl: URL,
    private readonly requestInit: RequestInit,
    private readonly options: RequestInit,
    readonly request: HttpRequest,
    readonly argv: unknown[]
  ) {
    if (!Internals.isAbsolute(request.url)) {
      this.url = new URL(request.url, baseUrl).href
    } else {
      this.url = request.url
    }
  }

  execute(): Promise<Response> {
    const timeout = this.request.bodyTimeout ?? 30e3
    const controller = new AbortController()

    if (this.request.signal) {
      const signal = this.request.signal as AbortSignal
      signal.addEventListener('abort', () => controller.abort())
    }

    const timer = setTimeout(() => controller.abort(), timeout)

    return fetch(
      this.url,
      FetchCall.requestInit(this.requestInit, this.options, this.request, controller.signal)
    ).finally(() => clearTimeout(timer))
  }

  static requestInit(
    requestInit: RequestInit,
    options: RequestInit,
    request: HttpRequest,
    signal: AbortSignal
  ): RequestInit {
    return {
      ...options,
      ...requestInit,
      method: request.method,
      headers: new Headers([...request.headers.entries()]),
      body: request.body as BodyInit,
      signal: signal
    }
  }
}

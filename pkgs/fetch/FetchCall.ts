import { Call, HttpRequest, Internals } from '@drizzle-http/core'

export class FetchCall implements Call<Response> {
  constructor(private readonly baseUrl: URL, private readonly requestInit: RequestInit) {}

  static requestInit(requestInit: RequestInit, request: HttpRequest, signal: AbortSignal): RequestInit {
    return {
      ...requestInit,
      method: request.method,
      headers: new Headers([...request.headers.entries()]),
      body: request.body as BodyInit,
      signal: signal
    }
  }

  execute(request: HttpRequest): Promise<Response> {
    const url = !Internals.isAbsolute(request.url) ? new URL(request.url, this.baseUrl).href : request.url
    const timeout = request.bodyTimeout ?? 30e3
    const controller = new AbortController()

    if (request.signal) {
      ;(request.signal as AbortSignal).addEventListener('abort', () => controller.abort())
    }

    const timer = setTimeout(() => controller.abort(), timeout)

    return fetch(url, FetchCall.requestInit(this.requestInit, request, controller.signal)).finally(() =>
      clearTimeout(timer)
    )
  }
}

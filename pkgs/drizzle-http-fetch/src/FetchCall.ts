import { Call, HttpError, HttpRequest, isAbsolute } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { RequestAbortedError } from './errors/RequestAbortedError'

export class FetchCall implements Call<Promise<Response>> {
  private readonly url: string

  constructor(
    baseUrl: URL,
    private readonly requestInit: RequestInit,
    private readonly options: RequestInit,
    readonly request: HttpRequest,
    readonly argv: unknown[]
  ) {
    if (!isAbsolute(request.url)) {
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

    return fetch(this.url, FetchCall.requestInit(this.requestInit, this.options, this.request, controller.signal))
      .then(response => {
        if (response.ok) {
          return response
        }

        throw new HttpError(this.request, response as unknown as HttpResponse)
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          throw new RequestAbortedError(this.request, 'aborted', timeout)
        }

        throw err
      })
      .finally(() => clearTimeout(timer))
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

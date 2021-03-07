import {
  Call,
  HttpError,
  InvalidArgumentError,
  isAbsolute,
  Request,
  Response,
  ResponseConverter
} from '@drizzle-http/core'
import { FetchInit } from './meta'
import AbortController from 'abort-controller'
import EventEmitter from 'events'
import { RequestAbortedError } from './err'

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

    if (!isAbsolute(request.url)) {
      request.url = new URL(request.url, url).href
    }
  }

  execute(): Promise<T> {
    const timeout = this.request.bodyTimeout ?? 30e3
    const controller = new AbortController()

    if (this.request.signal) {
      if (typeof this.request.signal.addEventListener === 'function') {
        this.request.signal.addEventListener('abort', () => controller.abort())
      } else if (this.request.signal instanceof EventEmitter) {
        this.request.signal.addListener('abort', () => controller.abort())
      } else {
        throw new InvalidArgumentError('Abort signal must be an EventEmitter or AbortController.signal', 'FetchCall')
      }
    }

    const timer = setTimeout(() => controller.abort(), timeout)

    return fetch(
      this.request.url,
      FetchCall.requestInit(this.requestInit, this.options, this.request, controller.signal)
    )
      .then(response => {
        if (response.ok) {
          return this.responseConverter.convert(response as any)
        }

        throw new HttpError(this.request, response as any)
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          throw new RequestAbortedError(this.request, 'aborted', timeout)
        }

        throw err
      })
      .finally(() => clearTimeout(timer))
  }

  static requestInit(requestInit: RequestInit, options: FetchInit, request: Request, signal: AbortSignal): FetchInit {
    return {
      ...options,
      ...requestInit,
      method: request.method,
      headers: (request.headers as unknown) as Headers,
      body: request.body as BodyInit,
      signal: signal
    }
  }
}

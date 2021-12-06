import { HttpRequest } from '@drizzle-http/core'
import { Dispatcher } from 'undici'

export function toUndiciRequest(request: HttpRequest, opaque?: unknown): Dispatcher.RequestOptions {
  return {
    path: request.url,
    method: request.method as Dispatcher.HttpMethod,
    body: request.body,
    headers: request.headers.toObject(),
    bodyTimeout: request.bodyTimeout,
    headersTimeout: request.headersTimeout,
    signal: request.signal,
    opaque
  }
}

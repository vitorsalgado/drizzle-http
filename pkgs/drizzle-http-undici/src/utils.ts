import { RequestOptions } from 'undici/types/client'
import { Request } from '@drizzle-http/core'

export function toUndiciRequest(request: Request, opaque?: unknown): RequestOptions {
  return {
    path: request.url,
    method: request.method,
    body: request.body,
    headers: request.headers.toObject(),
    bodyTimeout: request.bodyTimeout,
    headersTimeout: request.headersTimeout,
    signal: request.signal,
    opaque
  }
}

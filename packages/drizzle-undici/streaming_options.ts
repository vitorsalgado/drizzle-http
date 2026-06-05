import { IncomingHttpHeaders } from 'http'
import { Writable } from 'stream'
import type { StreamingResponse } from './streaming_response.js'

export interface StreamingHeadersContext {
  readonly statusCode: number
  readonly headers: IncomingHttpHeaders
  readonly destination: Writable
  readonly url: string
  readonly response: StreamingResponse
}

export interface StreamingOptions {
  onHeaders?: (ctx: StreamingHeadersContext) => Writable | void
  skipErrorBody?: boolean
}

export interface ResolvedStreamingOptions {
  readonly onHeaders?: StreamingOptions['onHeaders']
  readonly skipErrorBody: boolean
}

const DEFAULTS: ResolvedStreamingOptions = {
  skipErrorBody: true
}

export function resolveStreamingOptions(options?: StreamingOptions): ResolvedStreamingOptions {
  return {
    onHeaders: options?.onHeaders,
    skipErrorBody: options?.skipErrorBody ?? DEFAULTS.skipErrorBody
  }
}

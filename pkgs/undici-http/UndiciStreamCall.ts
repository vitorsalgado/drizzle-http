import { Writable } from 'stream'
import { IncomingHttpHeaders } from 'http'
import { Blob } from 'buffer'
import { Pool } from 'undici'
import { Call } from '@drizzle-http/core'
import { HttpError } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { HttpHeaders } from '@drizzle-http/core'
import { isOK } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { BodyType } from '@drizzle-http/core'
import { createMethodDecorator } from '@drizzle-http/core'
import { createParameterDecorator } from '@drizzle-http/core'
import { toUndiciRequest } from './toUndiciRequest'
import { Keys } from './Keys'

export function Streaming() {
  return createMethodDecorator(Streaming, ({ requestFactory }) => {
    requestFactory.ignoreResponseConverter()
    requestFactory.ignoreResponseHandler()
  })
}

export function StreamTo() {
  return createParameterDecorator(StreamTo, ctx =>
    ctx.requestFactory.addConfig(Keys.ConfigStreamToIndex, ctx.parameterIndex)
  )
}

interface HttpEmptyResponseInit {
  readonly headers: IncomingHttpHeaders
  readonly trailers: IncomingHttpHeaders
  readonly status: number
  readonly statusText: string
  readonly url: string
}

export class HttpEmptyResponse implements HttpResponse<BodyType, Blob, never> {
  readonly body: BodyType
  readonly headers: HttpHeaders
  readonly status: number
  readonly statusText: string
  readonly url: string

  constructor(url: string, private readonly init: HttpEmptyResponseInit) {
    const headers = new HttpHeaders(init.headers as Record<string, string>)
    headers.mergeObject(init.trailers as Record<string, string>)

    this.body = null
    this.headers = headers
    this.status = init.status
    this.statusText = ''
    this.url = url
  }

  get ok(): boolean {
    return isOK(this.status)
  }

  get bodyUsed(): boolean {
    return true
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    throw new TypeError('.arrayBuffer() is not applicable')
  }

  blob(): Promise<Blob> {
    throw new TypeError('.blob() is not applicable')
  }

  formData(): Promise<never> {
    throw new TypeError('.formData() is not applicable')
  }

  json<T>(): Promise<T> {
    throw new TypeError('.json() is not applicable')
  }

  text(): Promise<string> {
    throw new TypeError('.text() is not applicable')
  }
}

export class UndiciStreamCall implements Call<HttpEmptyResponse> {
  constructor(private readonly client: Pool, private readonly streamTo: number) {}

  async execute(request: HttpRequest, argv: unknown[]): Promise<HttpEmptyResponse> {
    return new Promise<HttpEmptyResponse>((resolve, reject) => {
      const partial = {} as Record<string, unknown>
      partial.url = request.url
      const to = argv[this.streamTo] as Writable

      this.client.stream(
        toUndiciRequest(request),
        ({ statusCode, headers }) => {
          partial.status = statusCode
          partial.headers = headers

          return to
        },
        (err, data) => {
          if (err) {
            return reject(err)
          }

          const response = new HttpEmptyResponse(partial.url as string, {
            status: partial.status as number,
            statusText: '',
            headers: partial.headers as IncomingHttpHeaders,
            trailers: data.trailers,
            url: partial.url as string
          })

          if (isOK(response.status)) {
            return resolve(response)
          }

          return reject(new HttpError(request, response))
        }
      )
    })
  }
}

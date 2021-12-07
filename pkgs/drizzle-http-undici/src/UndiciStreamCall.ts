import { Writable } from 'stream'
import { Pool } from 'undici'
import { Call } from '@drizzle-http/core'
import { DrizzleError } from '@drizzle-http/core'
import { HttpError } from '@drizzle-http/core'
import { DrizzleMeta } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { HttpHeaders } from '@drizzle-http/core'
import { isOK } from '@drizzle-http/core'
import { toUndiciRequest } from './toUndiciRequest'
import { Keys } from './Keys'

export function Streaming() {
  return (target: object, method: string) => {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
    requestFactory.ignoreResponseConverter()
    requestFactory.addConfig(Keys.ConfigIsStream, true)
  }
}

export function StreamTo() {
  return function (target: object, method: string, index: number): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
    requestFactory.ignoreResponseConverter()
    requestFactory.addConfig(Keys.ConfigStreamToIndex, index)
  }
}

/**
 * Represents a Stream Response
 */
export class StreamToResult {
  constructor(public url: string, public status: number, public headers: HttpHeaders, public stream: Writable) {}
}

export class StreamToHttpError extends DrizzleError {
  constructor(public readonly request: HttpRequest, public readonly response: StreamToResult) {
    super(`Request failed with status code: ${response.status}`, 'DRIZZLE_HTTP_STREAM_ERR_HTTP')
    Error.captureStackTrace(this, HttpError)
    this.name = 'StreamHttpError'
  }
}

export class UndiciStreamCall implements Call<Promise<StreamToResult>> {
  constructor(
    private readonly client: Pool,
    private readonly streamTo: number,
    readonly request: HttpRequest,
    readonly argv: unknown[]
  ) {}

  async execute(): Promise<StreamToResult> {
    return new Promise<StreamToResult>((resolve, reject) => {
      const response: Partial<StreamToResult> = { url: this.request.url }
      const to = this.argv[this.streamTo] as Writable

      this.client.stream(
        toUndiciRequest(this.request),
        ({ statusCode, headers }) => {
          response.status = statusCode
          response.headers = new HttpHeaders(headers as Record<string, string>)

          return to
        },
        (err, data) => {
          if (err) {
            return reject(new StreamToHttpError(this.request, response as StreamToResult))
          }

          response.headers?.mergeObject(data.trailers as Record<string, string>)
          response.stream = to

          if (isOK((response as StreamToResult).status)) {
            return resolve(response as StreamToResult)
          }

          return reject(new StreamToHttpError(this.request, response as StreamToResult))
        }
      )
    })
  }
}

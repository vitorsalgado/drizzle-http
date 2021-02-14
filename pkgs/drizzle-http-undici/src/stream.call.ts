import { Call, DrizzleError, DrizzleMeta, Headers, HttpError, Request, Response } from '@drizzle-http/core'
import { Pool } from 'undici'
import { Writable } from 'stream'
import { toUndiciRequest } from './utils'

export const ConfigIsStream = 'dh:undici:enable'
export const ConfigStreamToIndex = 'dh:undici:stream_index'

export function Streaming() {
  return (target: any, method: string) => {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.addConfig(ConfigIsStream, true)
    requestFactory.returnGenericType = StreamToResult
  }
}

export function StreamTo() {
  return function (target: any, method: string, index: number): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.addConfig(ConfigStreamToIndex, index)
  }
}

/**
 * Represents a Stream Response
 */
export class StreamToResult {
  constructor(
    public url: string,
    public status: number,
    public headers: Headers,
    public stream: Writable) {
  }
}

export class StreamToHttpError extends DrizzleError {
  constructor(public readonly request: Request, public readonly response: StreamToResult) {
    super(`Request failed with status code: ${response.status}`, 'DRIZZLE_HTTP_STREAM_ERR_HTTP')
    Error.captureStackTrace(this, HttpError)
    this.name = 'StreamHttpError'
  }
}

export class UndiciStreamCall extends Call<Promise<StreamToResult>> {
  constructor(
    private readonly client: Pool,
    private readonly streamTo: number,
    request: Request,
    argv: any[]
  ) {
    super(request, argv)
  }

  async execute(): Promise<StreamToResult> {
    return new Promise<StreamToResult>((resolve, reject) => {
      const response: any = { url: this.request.url }
      const to = this.argv[this.streamTo] as Writable

      this.client
        .stream(
          toUndiciRequest(this.request),
          ({ statusCode, headers }) => {
            response.status = statusCode
            response.headers = new Headers(headers as Record<string, string>)

            return to
          },
          (err, data) => {
            if (err) {
              return reject(new StreamToHttpError(this.request, response))
            }

            response.headers?.mergeObject(data.trailers as Record<string, string>)
            response.stream = to

            if (Response.isOK(response.status)) {
              return resolve(response as StreamToResult)
            }

            return reject(new StreamToHttpError(this.request, response))
          })
    })
  }
}

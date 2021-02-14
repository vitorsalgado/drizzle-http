import { Call, Headers, HttpError, Request, Response, ResponseConverter } from '@drizzle-http/core'
import { Pool } from 'undici'
import { toUndiciRequest } from './utils'
import { Writable } from 'stream'
import { IncomingHttpHeaders } from 'http'

export interface StreamerResult {
  data: Buffer,
  status: number,
  headers: Headers
}

export class Streamer extends Writable {
  private data: Buffer[]
  private length: number
  private collectable: boolean
  statusCode: number
  readonly headers: Headers

  constructor(private readonly resolve: any, private readonly reject: any) {
    super()
    this.data = []
    this.length = 0
    this.collectable = false
    this.statusCode = 0
    this.headers = new Headers({})
  }

  setResponse(statusCode: number, headers: IncomingHttpHeaders): this {
    this.statusCode = statusCode
    this.headers.mergeObject(headers as Record<string, string>)
    return this
  }

  addTrailers(trailers: Record<string, string>): void {
    this.headers.mergeObject(trailers)
  }

  finish(): void {
    this.resolve({
      data: Buffer.concat(this.data, this.length),
      status: this.statusCode,
      headers: this.headers
    } as StreamerResult)
  }

  // eslint-disable-next-line no-undef
  _write(chunk: any, _encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
    this.data.push(chunk)
    this.length += chunk.length

    callback()
  }

  _destroy(error: Error | null, callback: (error?: (Error | null)) => void) {
    if (error) {
      this.collectable = false
      this.data = []
      callback(error)
      this.reject(error)

      return
    }

    callback(null)
  }

  _final(callback: (error?: (Error | null)) => void) {
    this.collectable = true
    callback()
  }
}

export class UndiciCall<T> extends Call<Promise<T>> {
  constructor(
    private readonly client: Pool,
    private readonly responseConverter: ResponseConverter<Response, T>,
    request: Request,
    argv: any[]
  ) {
    super(request, argv)
  }

  execute(): Promise<T> {
    return new Promise<StreamerResult>((resolve, reject) => {
      this.client.stream(toUndiciRequest(this.request, new Streamer(resolve, reject)),
        (factory) =>
          (factory.opaque as Streamer).setResponse(factory.statusCode, factory.headers) as Writable,
        (err, data) => {
          if (err) {
            reject(err)
            return
          }

          const stream = data.opaque as Streamer

          stream.addTrailers(data.trailers as Record<string, string>)
          stream.finish()
        })
    })
      .then(res => new Response(res.data, { status: res.status, headers: res.headers, url: this.request.url }))
      .then(response => {
        if (response.ok) {
          return this.responseConverter.convert(response)
        }

        throw new HttpError(this.request, response)
      })
  }
}

import { Writable } from 'stream'
import { IncomingHttpHeaders } from 'http'
import { Pool } from 'undici'
import { Call } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { toUndiciRequest } from './toUndiciRequest'
import { StreamingResponse } from './StreamingResponse'

export class UndiciStreamCall implements Call<StreamingResponse> {
  constructor(private readonly client: Pool, private readonly streamTo: number) {}

  async execute(request: HttpRequest, argv: unknown[]): Promise<StreamingResponse> {
    return new Promise<StreamingResponse>((resolve, reject) => {
      const partial = {} as Record<string, unknown>
      partial.url = request.url

      this.client.stream(
        toUndiciRequest(request, argv[this.streamTo] as Writable),
        ({ statusCode, headers, opaque }) => {
          partial.status = statusCode
          partial.headers = headers

          return opaque as Writable
        },
        (err, data) => {
          if (err) {
            return reject(err)
          }

          const response = new StreamingResponse(partial.url as string, {
            status: partial.status as number,
            statusText: '',
            headers: partial.headers as IncomingHttpHeaders,
            trailers: data.trailers,
            url: partial.url as string
          })

          return resolve(response)
        }
      )
    })
  }
}

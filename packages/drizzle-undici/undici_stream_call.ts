import { Writable } from 'stream'
import { Pool } from 'undici'
import { Call, headersFromRecord, HttpRequest } from '@drizzle-http/core'
import { toUndiciRequest } from './to_undici_request.js'
import { DISCARD_WRITABLE } from './discard_writable.js'
import { ResolvedStreamingOptions } from './streaming_options.js'
import { StreamingCompletion, StreamingResponse } from './streaming_response.js'

interface StreamContext {
  readonly destination: Writable
  readonly url: string
  readonly options: ResolvedStreamingOptions
}

function assertWritable(target: unknown): asserts target is Writable {
  if (target == null || typeof (target as Writable).write !== 'function') {
    throw new TypeError('@StreamTo() argument must be a Writable stream.')
  }
}

export class UndiciStreamCall implements Call<StreamingResponse> {
  constructor(
    private readonly client: Pool,
    private readonly streamTo: number,
    private readonly options: ResolvedStreamingOptions
  ) {}

  execute(request: HttpRequest, argv: unknown[]): Promise<StreamingResponse> {
    const destination = argv[this.streamTo]
    assertWritable(destination)

    return new Promise<StreamingResponse>((resolveOuter, rejectOuter) => {
      let completedResolve!: (value: StreamingCompletion) => void
      let completedReject!: (reason: Error) => void

      const completed = new Promise<StreamingCompletion>((resolve, reject) => {
        completedResolve = resolve
        completedReject = reject
      })

      let headersReceived = false

      const context: StreamContext = {
        destination,
        url: request.url,
        options: this.options
      }

      this.client.stream(
        toUndiciRequest(request, context),
        ({ statusCode, headers, opaque }) => {
          const streamContext = opaque as StreamContext

          const response = new StreamingResponse(
            streamContext.url,
            {
              status: statusCode,
              statusText: '',
              headers
            },
            completed
          )

          headersReceived = true
          resolveOuter(response)

          let pipeTarget: Writable = streamContext.destination

          if (streamContext.options.onHeaders) {
            const override = streamContext.options.onHeaders({
              statusCode,
              headers,
              destination: streamContext.destination,
              url: streamContext.url,
              response
            })

            if (override) {
              pipeTarget = override
            }
          } else if (streamContext.options.skipErrorBody && statusCode >= 400) {
            pipeTarget = DISCARD_WRITABLE
          }

          return pipeTarget
        },
        (err, data) => {
          if (err) {
            if (headersReceived) {
              completedReject(err)
            } else {
              rejectOuter(err)
            }

            return
          }

          completedResolve({
            trailers: headersFromRecord(data.trailers)
          })
        }
      )
    })
  }
}

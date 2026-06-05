import { URL } from 'url'
import { CallFactory, Drizzle, RequestFactory } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import { Internals } from '@drizzle-http/core'
import { Pool } from 'undici'
import { UndiciStreamCall } from './undici_stream_call.js'
import { UndiciCall } from './undici_call.js'
import { Keys } from './keys.js'
import { UndiciResponse } from './undici_response.js'
import { Streaming } from './streaming.js'
import { StreamingResponse } from './streaming_response.js'

const { notNull } = Internals

export class UndiciCallFactory implements CallFactory {
  private _pool!: Pool
  private readonly _options?: Pool.Options

  constructor(opts?: Pool.Options) {
    this._options = opts
  }

  pool(): Pool | undefined {
    return this._pool
  }

  setup(drizzle: Drizzle): void {
    this._pool = new Pool(new URL(drizzle.baseUrl()).origin, this._options)

    drizzle.registerShutdownHook(async () => {
      if (!this._pool?.closed) {
        await this._pool?.close()
      }
    })
  }

  provide(drizzle: Drizzle, requestFactory: RequestFactory): Call<UndiciResponse | StreamingResponse> {
    notNull(this._pool)

    const streamToIndex = Number(requestFactory.getConfig(Keys.StreamTargetIndex)) as number

    if (requestFactory.hasDecorator(Streaming)) {
      if (isNaN(streamToIndex) || streamToIndex < 0) {
        throw new Internals.InvalidMethodConfigError(
          'Method is decorated with @Streaming but there is no argument decorated with @StreamTo().',
          requestFactory.method
        )
      }

      return new UndiciStreamCall(this._pool, streamToIndex)
    } else {
      if (streamToIndex > -1) {
        throw new Internals.InvalidMethodConfigError(
          'Found an argument decorated with @StreamTo() but method is not decorated with @Streaming().',
          requestFactory.method
        )
      }
    }

    return new UndiciCall(this._pool)
  }
}

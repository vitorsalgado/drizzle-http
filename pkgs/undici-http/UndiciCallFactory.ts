import { URL } from 'url'
import { CallFactory, Drizzle, RequestFactory } from '@drizzle-http/core'
import { Internals } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import { Pool } from 'undici'
import { UndiciStreamCall } from './UndiciStreamCall'
import { HttpEmptyResponse } from './UndiciStreamCall'
import { UndiciCall } from './UndiciCall'
import { Keys } from './Keys'
import { UndiciResponse } from './UndiciResponse'

export class UndiciCallFactory implements CallFactory {
  private _pool?: Pool
  private readonly _options?: Pool.Options

  constructor(opts?: Pool.Options) {
    this._options = opts
  }

  pool(): Pool | undefined {
    return this._pool
  }

  setup(drizzle: Drizzle): void {
    this._pool = new Pool(new URL(drizzle.baseUrl()).origin, this._options)

    drizzle.registerShutdownHook(async () => await this._pool?.close())
  }

  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): Call<UndiciResponse | HttpEmptyResponse> {
    if (!this._pool) {
      throw new Error('Undici pool must not be null or undefined.')
    }

    if (requestFactory.getConfig(Keys.ConfigIsStream)) {
      const streamToIndex = requestFactory.getConfig(Keys.ConfigStreamToIndex) as number

      if (streamToIndex < 0) {
        throw new Internals.InvalidMethodConfigError(
          'Method is decorated with @Streaming but there is no argument decorated with @StreamTo().',
          method
        )
      }

      return new UndiciStreamCall(this._pool, streamToIndex)
    } else {
      const streamToIndex = requestFactory.getConfig(Keys.ConfigStreamToIndex) as number

      if (streamToIndex > -1) {
        throw new Internals.InvalidMethodConfigError(
          'Found an argument decorated with @StreamTo() but method is not decorated with @Streaming()',
          method
        )
      }
    }

    return new UndiciCall(this._pool)
  }
}

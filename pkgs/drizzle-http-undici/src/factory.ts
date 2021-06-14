import {
  Call,
  CallFactory,
  CallProvider,
  Drizzle,
  InvalidRequestMethodConfigurationError,
  Request,
  RequestFactory
} from '@drizzle-http/core'
import { Pool } from 'undici'
import { UndiciCall } from './call'
import { ConfigIsStream, ConfigStreamToIndex, UndiciStreamCall } from './stream.call'
import { URL } from 'url'

export class UndiciCallFactory extends CallFactory {
  static DEFAULT: CallFactory = new UndiciCallFactory()

  private _pool!: Pool
  private readonly _options?: Pool.Options

  constructor(opts?: Pool.Options) {
    super()
    this._options = opts
  }

  setup(drizzle: Drizzle): void {
    this._pool = new Pool(new URL(drizzle.baseUrl).origin, this._options)

    drizzle.registerShutdownHook(async () => {
      if (this._pool !== null) {
        await this._pool.close()
      }
    })
  }

  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    if (self._pool === null) {
      throw new TypeError('Undici Pool must not be null.')
    }

    // stream to
    if (requestFactory.getConfig(ConfigIsStream)) {
      const streamToIndex = requestFactory.getConfig(ConfigStreamToIndex) as number

      if (streamToIndex < 0) {
        throw new InvalidRequestMethodConfigurationError(
          'Method is decorated with @Streaming but there is no argument decorated with @StreamTo().',
          method
        )
      }

      return function (request: Request, args: any[]): Call<unknown> {
        return new UndiciStreamCall(self._pool, streamToIndex, request, args)
      }
    } else {
      const streamToIndex = requestFactory.getConfig(ConfigStreamToIndex) as number

      if (streamToIndex > -1) {
        throw new InvalidRequestMethodConfigurationError(
          'Found an argument decorated with @StreamTo() but method is not decorated with @Streaming()',
          method
        )
      }
    }

    return function (request: Request, args: any[]): Call<unknown> {
      return new UndiciCall(self._pool, request, args)
    }
  }
}

import { Call, CallFactory, Drizzle, RequestFactory } from '@drizzle-http/core'
import { FetchCall } from './FetchCall'
import { Keys } from './Keys'

export class FetchCallFactory implements CallFactory {
  static DEFAULT: FetchCallFactory = new FetchCallFactory({})

  constructor(private readonly options: RequestInit = {}) {}

  setup(_drizzle: Drizzle): void {
    // no setup needed
  }

  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): Call<Response> {
    const requestInit = requestFactory.getConfig(Keys.ConfigKeyRequestInit) as RequestInit
    const url = new URL(drizzle.baseUrl())

    return new FetchCall(url, requestInit, this.options)
  }
}

import { Call, CallFactory, Drizzle, RequestFactory } from '@drizzle-http/core'
import { Metadata } from '@drizzle-http/core'
import { FetchCall } from './FetchCall'
import { Keys } from './Keys'

export class FetchCallFactory implements CallFactory {
  static DEFAULT: FetchCallFactory = new FetchCallFactory({})

  constructor(private readonly options: RequestInit = {}) {}

  setup(): void {
    // no setup needed
  }

  provide(drizzle: Drizzle, requestFactory: RequestFactory): Call<Response> {
    const defaults = Metadata.apiDefaults(requestFactory.apiOwner())
    let def: RequestInit = {}

    if (defaults.hasConfig(Keys.RequestInitDefaults)) {
      def = defaults.getConfig(Keys.RequestInitDefaults)
    }

    const requestInit = requestFactory.getConfig(Keys.RequestInitMethod) as RequestInit
    const url = new URL(drizzle.baseUrl())

    return new FetchCall(url, { ...this.options, ...def, ...requestInit })
  }
}

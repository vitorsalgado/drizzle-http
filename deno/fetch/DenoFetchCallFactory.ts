import { Call, CallFactory } from '../Call.ts'
import { RequestFactory } from '../RequestFactory.ts'
import { Drizzle } from '../Drizzle.ts'
import { Metadata } from '../ApiParameterization.ts'
import { DenoFetchCall } from './DenoFetchCall.ts'
import { Keys } from './Keys.ts'

export class DenoFetchCallFactory implements CallFactory {
  static DEFAULT: DenoFetchCallFactory = new DenoFetchCallFactory({})

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

    return new DenoFetchCall(url, { ...this.options, ...def, ...requestInit })
  }
}

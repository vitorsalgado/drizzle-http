import { Call, CallFactory, Drizzle, RequestFactory } from '@drizzle-http/core'
import { Metadata } from '@drizzle-http/core'
import { FetchCall } from './FetchCall'
import { Cache } from './decorators'
import { Mode } from './decorators'
import { Credentials } from './decorators'
import { Integrity } from './decorators'
import { KeepAlive } from './decorators'
import { Redirect } from './decorators'
import { Referrer } from './decorators'
import { ReferrerPolicy } from './decorators'

export class FetchCallFactory implements CallFactory {
  static DEFAULT: FetchCallFactory = new FetchCallFactory({})

  constructor(private readonly options: RequestInit = {}) {}

  setup(): void {
    // no setup needed
  }

  provide(drizzle: Drizzle, requestFactory: RequestFactory): Call<Response> {
    const defaults = Metadata.apiDefaults(requestFactory.apiOwner())

    const def: RequestInit = {
      cache: defaults.getConfig(Cache.Key),
      mode: defaults.getConfig(Mode.Key),
      credentials: defaults.getConfig(Credentials.Key),
      integrity: defaults.getConfig(Integrity.Key),
      keepalive: defaults.getConfig(KeepAlive.Key),
      redirect: defaults.getConfig(Redirect.Key),
      referrer: defaults.getConfig(Referrer.Key),
      referrerPolicy: defaults.getConfig(ReferrerPolicy.Key)
    }

    const req: RequestInit = {
      cache: requestFactory.getConfig(Cache.Key),
      mode: requestFactory.getConfig(Mode.Key),
      credentials: requestFactory.getConfig(Credentials.Key),
      integrity: requestFactory.getConfig(Integrity.Key),
      keepalive: requestFactory.getConfig(KeepAlive.Key),
      redirect: requestFactory.getConfig(Redirect.Key),
      referrer: requestFactory.getConfig(Referrer.Key),
      referrerPolicy: requestFactory.getConfig(ReferrerPolicy.Key)
    }

    return new FetchCall(new URL(drizzle.baseUrl()), { ...this.options, ...def, ...req })
  }
}

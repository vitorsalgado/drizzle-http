import { apiDefaults, Call, CallFactory, Drizzle, RequestFactory } from '@drizzle-http/core'
import { FetchCall } from './fetch_call.js'
import { Cache } from './decorators/index.js'
import { Mode } from './decorators/index.js'
import { Credentials } from './decorators/index.js'
import { Integrity } from './decorators/index.js'
import { KeepAlive } from './decorators/index.js'
import { Redirect } from './decorators/index.js'
import { Referrer } from './decorators/index.js'
import { ReferrerPolicy } from './decorators/index.js'

export class FetchCallFactory implements CallFactory {
  static DEFAULT: FetchCallFactory = new FetchCallFactory({})

  constructor(private readonly options: RequestInit = {}) {}

  setup(): void {
    // no setup needed
  }

  provide(drizzle: Drizzle, requestFactory: RequestFactory): Call<Response> {
    const defaults = apiDefaults(requestFactory.apiOwner())

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

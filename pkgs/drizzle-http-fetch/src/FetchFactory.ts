import { Call, CallFactory, CallProvider, Drizzle, RequestFactory } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { FetchCall } from './FetchCall'
import { FetchInit } from './FetchInit'
import { Keys } from './Keys'

export class FetchCallFactory extends CallFactory {
  static DEFAULT: FetchCallFactory = new FetchCallFactory({})

  constructor(private readonly options: FetchInit = {}) {
    super()
  }

  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    const requestInit = requestFactory.getConfig(Keys.ConfigKeyRequestInit) as RequestInit
    const url = new URL(drizzle.baseUrl)
    const opts = this.options

    return function (request: HttpRequest, args: unknown[]): Call<unknown> {
      return new FetchCall(url, requestInit, opts, request, args)
    }
  }
}
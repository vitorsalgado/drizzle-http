import { Call, CallFactory, CallProvider, Drizzle, Request, RequestFactory } from '@drizzle-http/core'
import { FetchCall } from './call'
import { ConfigKeyRequestInit, FetchInit } from './meta'
import NodeFetch from 'node-fetch'

export class FetchCallFactory extends CallFactory {
  static DEFAULT: FetchCallFactory = new FetchCallFactory({})

  constructor(private readonly options: FetchInit) {
    super()
  }

  setup(drizzle: Drizzle): void {
    if (!globalThis.fetch) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      globalThis.fetch = NodeFetch
    }
  }

  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    const requestInit = requestFactory.getConfig(ConfigKeyRequestInit) as RequestInit
    const url = new URL(drizzle.baseUrl)
    const opts = this.options

    return function (request: Request, args: any[]): Call<unknown> {
      return new FetchCall(url, requestInit, opts, request, args)
    }
  }
}

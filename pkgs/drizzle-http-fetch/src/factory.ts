import { Call, CallFactory, CallProvider, Drizzle, Request, RequestFactory } from '@drizzle-http/core'
import { FetchCall } from './call'
import { ConfigKeyRequestInit } from './meta'

export class FetchCallFactory extends CallFactory {
  static DEFAULT: FetchCallFactory = new FetchCallFactory()

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup(drizzle: Drizzle): void {}

  prepareCall(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallProvider {
    const responseConverter = drizzle.responseBodyConverter(method, requestFactory)
    const requestInit = requestFactory.getConfig(ConfigKeyRequestInit) as RequestInit
    const url = new URL(drizzle.baseUrl)

    return function (request: Request, args: any[]): Call<unknown> {
      return new FetchCall(url, requestInit, responseConverter, request, args)
    }
  }
}

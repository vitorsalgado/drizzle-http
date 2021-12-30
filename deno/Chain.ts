import { HttpRequest } from './HttpRequest.ts'
import { HttpResponse } from './HttpResponse.ts'
import { RequestFactory } from './RequestFactory.ts'

export interface Chain {
  requestFactory(): RequestFactory

  method(): string

  request(): HttpRequest

  argv(): unknown[]

  proceed(request: HttpRequest): Promise<HttpResponse>
}

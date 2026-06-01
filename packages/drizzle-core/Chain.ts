import { HttpRequest } from './HttpRequest.js'
import { HttpResponse } from './HttpResponse.js'
import { RequestFactory } from './RequestFactory.js'

export interface Chain {
  requestFactory(): RequestFactory

  method(): string

  request(): HttpRequest

  argv(): unknown[]

  proceed(request: HttpRequest): Promise<HttpResponse>
}

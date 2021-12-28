import { HttpRequest } from './HttpRequest'
import { HttpResponse } from './HttpResponse'
import { RequestFactory } from './RequestFactory'

export interface Chain {
  requestFactory(): RequestFactory

  method(): string

  request(): HttpRequest

  argv(): unknown[]

  proceed(request: HttpRequest): Promise<HttpResponse>
}

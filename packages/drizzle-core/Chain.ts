import { HttpRequest } from './http_request.js'
import { HttpResponse } from './http_response.js'
import { RequestFactory } from './request_factory.js'

export interface Chain {
  requestFactory(): RequestFactory

  method(): string

  request(): HttpRequest

  argv(): unknown[]

  proceed(request: HttpRequest): Promise<HttpResponse>
}

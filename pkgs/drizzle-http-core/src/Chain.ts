import { HttpRequest } from './HttpRequest'
import { HttpResponse } from './HttpResponse'

export interface Chain {
  request(): HttpRequest

  argv(): unknown[]

  proceed(request: HttpRequest): Promise<HttpResponse>
}

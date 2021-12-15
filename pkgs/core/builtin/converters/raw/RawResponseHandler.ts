import { ResponseHandler } from '../../../ResponseHandler'
import { HttpRequest } from '../../../HttpRequest'
import { HttpResponse } from '../../../HttpResponse'

export class RawResponseHandler implements ResponseHandler {
  async handle(request: HttpRequest, response: HttpResponse): Promise<HttpResponse> {
    return response
  }
}

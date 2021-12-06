import { HttpResponse } from '../../../../HttpResponse'
import { ResponseConverter } from '../../../../ResponseConverter'

export class RawResponseConverter implements ResponseConverter<HttpResponse, Promise<HttpResponse>> {
  static INSTANCE: RawResponseConverter = new RawResponseConverter()

  async convert(from: HttpResponse): Promise<HttpResponse> {
    return from
  }
}

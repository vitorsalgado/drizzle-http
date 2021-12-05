import { ResponseConverter } from '../../../../response.converter'
import { DzResponse } from '../../../../DzResponse'

export class RawResponseConverter implements ResponseConverter<DzResponse, Promise<DzResponse>> {
  static INSTANCE: RawResponseConverter = new RawResponseConverter()

  async convert(from: DzResponse): Promise<DzResponse> {
    return from
  }
}

import { ResponseConverter } from '../../../../response.converter'
import { DzResponse } from '../../../../DzResponse'

export class JsonResponseConverter<T> implements ResponseConverter<DzResponse, Promise<T>> {
  static INSTANCE: JsonResponseConverter<unknown> = new JsonResponseConverter<unknown>()

  convert<T>(from: DzResponse): Promise<T> {
    return from.json()
  }
}

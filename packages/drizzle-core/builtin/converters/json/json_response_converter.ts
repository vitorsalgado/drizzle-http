import { HttpResponse } from '../../../http_response.js'
import { ResponseConverter } from '../../../response_converter.js'

export class JsonResponseConverter<T> implements ResponseConverter<T> {
  static INSTANCE: JsonResponseConverter<unknown> = new JsonResponseConverter<unknown>()

  async convert<T>(from: HttpResponse): Promise<T> {
    if (from.status === 204) {
      return undefined as unknown as T
    }

    return from.json()
  }
}

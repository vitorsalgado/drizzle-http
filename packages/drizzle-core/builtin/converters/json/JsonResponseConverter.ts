import { HttpResponse } from '../../../HttpResponse'
import { ResponseConverter } from '../../../ResponseConverter'

export class JsonResponseConverter<T> implements ResponseConverter<T> {
  static INSTANCE: JsonResponseConverter<unknown> = new JsonResponseConverter<unknown>()

  async convert<T>(from: HttpResponse): Promise<T> {
    if (from.status === 204) {
      return undefined as unknown as T
    }

    return from.json()
  }
}

import { HttpResponse } from '../../../../HttpResponse'
import { ResponseConverter } from '../../../../ResponseConverter'

export class JsonResponseConverter<T> implements ResponseConverter<HttpResponse, Promise<T>> {
  static INSTANCE: JsonResponseConverter<unknown> = new JsonResponseConverter<unknown>()

  convert<T>(from: HttpResponse): Promise<T> {
    return from.json()
  }
}

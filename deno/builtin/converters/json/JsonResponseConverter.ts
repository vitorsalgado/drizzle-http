import { ResponseConverter } from "../../../ResponseConverter.ts";

export class JsonResponseConverter<T> implements ResponseConverter<T> {
  static INSTANCE = new JsonResponseConverter<unknown>();

  convert<T>(from: Response): Promise<T> {
    if (from.status === 204) {
      return Promise.resolve(undefined as unknown as T);
    }

    return from.json();
  }
}

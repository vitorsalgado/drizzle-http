// deno-lint-ignore-file no-unused-vars

import {
  ResponseConverter,
  ResponseConverterFactory,
} from "../../../ResponseConverter.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { BuiltInConv } from "../../BuiltInConv.ts";

class PlainTextResponseConverter implements ResponseConverter<string> {
  static INSTANCE = new PlainTextResponseConverter();

  convert(from: Response): Promise<string> {
    if (from.status === 204) {
      return Promise.resolve("");
    }

    return from.text();
  }
}

export class PlainTextResponseConverterFactory
  implements ResponseConverterFactory {
  provide(
    drizzle: Drizzle,
    responseType: string,
  ): ResponseConverter<unknown> | null {
    if (responseType === BuiltInConv.TEXT) {
      return PlainTextResponseConverter.INSTANCE;
    }

    return null;
  }
}

// deno-lint-ignore-file no-unused-vars

import { Drizzle } from "../../../Drizzle.ts";
import {
  ResponseConverter,
  ResponseConverterFactory,
} from "../../../ResponseConverter.ts";
import { BuiltInConv } from "../../BuiltInConv.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { JsonResponseConverter } from "./JsonResponseConverter.ts";

export class JsonResponseConverterFactory implements ResponseConverterFactory {
  static INSTANCE = new JsonResponseConverterFactory();

  provide<T>(
    drizzle: Drizzle,
    responseType: string,
    requestFactory: RequestFactory,
  ): ResponseConverter<T> | null {
    if (responseType === BuiltInConv.JSON) {
      return JsonResponseConverter.INSTANCE;
    }

    return null;
  }
}

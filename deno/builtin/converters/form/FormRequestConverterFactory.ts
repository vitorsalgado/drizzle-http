// deno-lint-ignore-file no-unused-vars

import {
  RequestBodyConverter,
  RequestBodyConverterFactory,
} from "../../../RequestBodyConverter.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { BuiltInConv } from "../../BuiltInConv.ts";
import { FormRequestConverter } from "./FormRequestConverter.ts";

export class FormRequestConverterFactory
  implements RequestBodyConverterFactory {
  static INSTANCE = new FormRequestConverterFactory();

  provide(
    drizzle: Drizzle,
    method: string,
    requestFactory: RequestFactory,
  ): RequestBodyConverter<unknown> | null {
    if (
      requestFactory.isFormUrlEncoded() ||
      requestFactory.requestTypeIs(BuiltInConv.FORM_URL_ENCODED)
    ) {
      return FormRequestConverter.INSTANCE;
    }

    return null;
  }
}

// deno-lint-ignore-file no-unused-vars

import { RequestFactory } from "../../../RequestFactory.ts";
import { RequestBodyConverter } from "../../../RequestBodyConverter.ts";
import { BodyType } from "../../../BodyType.ts";
import { RequestParameterization } from "../../../RequestParameterization.ts";
import { JsonType } from "../../../internal/types/mod.ts";

export class JsonRequestConverter implements RequestBodyConverter<string> {
  static INSTANCE = new JsonRequestConverter();

  convert(
    requestFactory: RequestFactory,
    requestValues: RequestParameterization,
    value: string | JsonType | Array<string>,
  ) {
    if (value.constructor === Object || Array.isArray(value)) {
      requestValues.body = JSON.stringify(value);
      return;
    }

    requestValues.body = value as BodyType;
  }
}

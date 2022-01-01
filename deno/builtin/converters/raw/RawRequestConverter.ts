// deno-lint-ignore-file no-unused-vars

import { RequestFactory } from "../../../RequestFactory.ts";
import {
  RequestBodyConverter,
  RequestBodyConverterFactory,
} from "../../../RequestBodyConverter.ts";
import { BodyType } from "../../../BodyType.ts";
import { RequestParameterization } from "../../../RequestParameterization.ts";
import { Drizzle } from "../../../Drizzle.ts";

export class RawRequestConverter implements RequestBodyConverter<BodyType> {
  static INSTANCE = new RawRequestConverter();

  convert(
    requestFactory: RequestFactory,
    requestValues: RequestParameterization,
    value: BodyType,
  ) {
    requestValues.body = value;
  }
}

export class RawRequestConverterFactory implements RequestBodyConverterFactory {
  static INSTANCE = new RawRequestConverterFactory();

  provide(
    _drizzle: Drizzle,
    _method: string,
    _requestFactory: RequestFactory,
  ): RequestBodyConverter<unknown> | null {
    return RawRequestConverter.INSTANCE;
  }
}

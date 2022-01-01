import { RequestFactory } from "../../../RequestFactory.ts";
import { RequestBodyConverter } from "../../../RequestBodyConverter.ts";
import { BodyType } from "../../../BodyType.ts";
import { MediaTypes } from "../../../MediaTypes.ts";
import { RequestBodyTypeNotAllowedError } from "../../../internal/mod.ts";
import { RequestParameterization } from "../../../RequestParameterization.ts";

export class FormRequestConverter implements RequestBodyConverter<unknown> {
  static INSTANCE = new FormRequestConverter();

  convert(
    requestFactory: RequestFactory,
    requestValues: RequestParameterization,
    value: Record<string, string> | Array<string>,
  ) {
    if (value instanceof URLSearchParams) {
      requestValues.body = value.toString();
    } else if (value.constructor === Object) {
      const params = new URLSearchParams();

      for (const [prop, v] of Object.entries(value)) {
        if (typeof v === "string") {
          params.append(prop, v);
        } else {
          params.append(prop, String(v));
        }
      }

      requestValues.body = params.toString();

      return;
    } else if (Array.isArray(value) && value.length > 0) {
      if (!Array.isArray(value[0])) {
        throw new RequestBodyTypeNotAllowedError(
          requestFactory.method,
          `${MediaTypes.APPLICATION_FORM_URL_ENCODED} @Body() arg must be a object, 2d Array or string.`,
        );
      }

      const params = new URLSearchParams();

      for (let i = 0; i < value.length; i++) {
        params.append(value[i][0], value[i][1]);
      }

      requestValues.body = params.toString();

      return;
    }

    requestValues.body = value as unknown as BodyType;
  }
}

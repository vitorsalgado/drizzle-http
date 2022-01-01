// deno-lint-ignore-file no-unused-vars

import { ParameterHandler } from "../ParameterHandler.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { Parameter } from "../Parameter.ts";
import { ParameterHandlerFactory } from "../ParameterHandlerFactory.ts";
import { RequestParameterization } from "../../../RequestParameterization.ts";

export class FormParameter extends Parameter {
  static Type = "form_field";

  constructor(public readonly key: string, public readonly index: number) {
    super(index, FormParameter.Type);
  }
}

export class FormParameterHandler
  implements ParameterHandler<string | string[]> {
  constructor(readonly parameter: FormParameter) {
  }

  handle(
    requestValues: RequestParameterization,
    value: string | string[],
  ) {
    if (value === null || typeof value === "undefined") {
      return;
    }

    if (typeof value === "string") {
      requestValues.formFields.append(this.parameter.key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        requestValues.formFields.append(this.parameter.key, item);
      }
    } else {
      requestValues.formFields.append(this.parameter.key, String(value));
    }
  }
}

export class FormParameterHandlerFactory
  implements ParameterHandlerFactory<FormParameter, string | string[]> {
  static INSTANCE = new FormParameterHandlerFactory();

  provide(
    drizzle: Drizzle,
    rf: RequestFactory,
    p: FormParameter,
  ): ParameterHandler<string | string[]> | null {
    if (p.type === FormParameter.Type) {
      return new FormParameterHandler(p);
    }

    return null;
  }
}

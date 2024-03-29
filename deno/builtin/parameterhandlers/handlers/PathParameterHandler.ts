// deno-lint-ignore-file no-unused-vars

import { ParameterHandler } from "../ParameterHandler.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { Parameter } from "../Parameter.ts";
import { ParameterHandlerFactory } from "../ParameterHandlerFactory.ts";
import { RequestParameterization } from "../../../RequestParameterization.ts";
import { encodeIfNecessary } from "../../../internal/mod.ts";

export class PathParameter extends Parameter {
  static Type = "path_param";

  constructor(
    public readonly key: string,
    public readonly regex: RegExp,
    public readonly index: number,
  ) {
    super(index, PathParameter.Type);
  }
}

export class PathParameterHandler
  implements ParameterHandler<string | string[]> {
  constructor(readonly parameter: PathParameter) {}

  handle(
    requestValues: RequestParameterization,
    value: string | string[],
  ) {
    if (value === null || typeof value === "undefined") {
      throw new TypeError(
        `Path parameter "${this.parameter.key}" must not be null or undefined.`,
      );
    }

    let v: string | string[];

    if (typeof value === "string") {
      v = value;
    } else if (Array.isArray(value)) {
      v = value.join(",");
    } else {
      v = String(value);
    }

    requestValues.path = requestValues.path.replace(
      this.parameter.regex,
      encodeIfNecessary(v),
    );
  }
}

export class PathParameterHandlerFactory
  implements ParameterHandlerFactory<PathParameter, string | string[]> {
  static INSTANCE = new PathParameterHandlerFactory();

  provide(
    drizzle: Drizzle,
    rf: RequestFactory,
    p: PathParameter,
  ): ParameterHandler<string | string[]> | null {
    if (p.type === PathParameter.Type) {
      return new PathParameterHandler(p);
    }

    return null;
  }
}

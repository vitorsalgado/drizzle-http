// deno-lint-ignore-file no-unused-vars

import { ParameterHandler } from "../ParameterHandler.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { Parameter } from "../Parameter.ts";
import { ParameterHandlerFactory } from "../ParameterHandlerFactory.ts";
import { encodeIfNecessary } from "../../../internal/mod.ts";
import { RequestParameterization } from "../../../RequestParameterization.ts";

export class QueryParameter extends Parameter {
  static Type = "query";

  constructor(public readonly key: string, public readonly index: number) {
    super(index, QueryParameter.Type);
  }
}

export class QueryParameterHandler
  implements ParameterHandler<string | string[]> {
  constructor(readonly parameter: QueryParameter) {}

  handle(
    requestValues: RequestParameterization,
    value: string | string[],
  ) {
    if (value === null || typeof value === "undefined") {
      return;
    }

    if (typeof value === "string") {
      requestValues.query.push(
        this.parameter.key + "=" + encodeIfNecessary(value),
      );
    } else if (Array.isArray(value)) {
      for (const item of value) {
        requestValues.query.push(
          this.parameter.key + "=" + encodeIfNecessary(item),
        );
      }
    } else {
      requestValues.query.push(
        this.parameter.key + "=" + encodeIfNecessary(String(value)),
      );
    }
  }
}

export class QueryParameterHandlerFactory
  implements ParameterHandlerFactory<QueryParameter, string | string[]> {
  static INSTANCE = new QueryParameterHandlerFactory();

  provide(
    drizzle: Drizzle,
    rf: RequestFactory,
    p: QueryParameter,
  ): ParameterHandler<string | string[]> | null {
    if (p.type === QueryParameter.Type) {
      return new QueryParameterHandler(p);
    }

    return null;
  }
}

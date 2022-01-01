import { ParameterHandler } from "../ParameterHandler.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { RequestBodyConverter } from "../../../RequestBodyConverter.ts";
import { Parameter } from "../Parameter.ts";
import { BodyType } from "../../../BodyType.ts";
import { ParameterHandlerFactory } from "../ParameterHandlerFactory.ts";
import { RequestParameterization } from "../../../RequestParameterization.ts";

export class BodyParameter extends Parameter {
  static Type = "body";

  constructor(public readonly index: number) {
    super(index, BodyParameter.Type);
  }
}

export class BodyParameterHandler implements ParameterHandler<BodyType> {
  constructor(
    private readonly converter: RequestBodyConverter<BodyType>,
    private readonly requestFactory: RequestFactory,
  ) {}

  handle(requestValues: RequestParameterization, value: BodyType) {
    if (value === null || typeof value === "undefined") {
      return;
    }

    this.converter.convert(this.requestFactory, requestValues, value);
  }
}

export class BodyParameterHandlerFactory
  implements ParameterHandlerFactory<BodyParameter, BodyType> {
  static INSTANCE = new BodyParameterHandlerFactory();

  provide(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
    p: BodyParameter,
  ): ParameterHandler<BodyType> | null {
    if (p.type !== BodyParameter.Type) {
      return null;
    }

    return new BodyParameterHandler(
      drizzle.requestBodyConverter(requestFactory),
      requestFactory,
    );
  }
}

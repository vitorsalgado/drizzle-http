import { createClassAndMethodDecorator } from "../ApiParameterization.ts";
import { BuiltInConv } from "../builtin/mod.ts";

export function JsonRequest() {
  return createClassAndMethodDecorator(
    JsonRequest,
    (defaults) => (defaults.requestType = BuiltInConv.JSON),
    (requestFactory) => (requestFactory.requestType = BuiltInConv.JSON),
  );
}

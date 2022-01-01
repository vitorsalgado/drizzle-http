import { createClassAndMethodDecorator } from "../ApiParameterization.ts";
import { BuiltInConv } from "../builtin/mod.ts";

export function JsonResponse() {
  return createClassAndMethodDecorator(
    JsonResponse,
    (defaults) => (defaults.responseType = BuiltInConv.JSON),
    (requestFactory) => (requestFactory.responseType = BuiltInConv.JSON),
  );
}

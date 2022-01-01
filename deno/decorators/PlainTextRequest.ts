import { createClassAndMethodDecorator } from "../ApiParameterization.ts";
import { BuiltInConv } from "../builtin/mod.ts";

export function PlainTextRequest() {
  return createClassAndMethodDecorator(
    PlainTextRequest,
    (defaults) => (defaults.requestType = BuiltInConv.TEXT),
    (requestFactory) => (requestFactory.requestType = BuiltInConv.TEXT),
  );
}

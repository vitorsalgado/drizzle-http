import { createClassAndMethodDecorator } from "../ApiParameterization.ts";
import { BuiltInConv } from "../builtin/mod.ts";

export const Multipart = () =>
  createClassAndMethodDecorator(
    Multipart,
    (defaults) => (defaults.requestType = BuiltInConv.MULTIPART),
    (requestFactory) => (requestFactory.requestType = BuiltInConv.MULTIPART),
  );

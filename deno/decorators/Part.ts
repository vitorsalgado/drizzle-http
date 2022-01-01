import { createParameterDecorator } from "../ApiParameterization.ts";
import { PartParameter } from "../builtin/mod.ts";

export function Part(name: string, filename?: string) {
  return createParameterDecorator(
    Part,
    (ctx) =>
      ctx.requestFactory.addParameter(
        new PartParameter(ctx.parameterIndex, name, filename),
      ),
  );
}

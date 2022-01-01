import { createParameterDecorator } from "../ApiParameterization.ts";
import { ModelParameter } from "../builtin/mod.ts";
import { Class } from "../internal/mod.ts";

export function Model(model: Class) {
  return createParameterDecorator(Model, (ctx) => {
    ctx.requestFactory.skipCheckIfPathParamsAreInSyncWithUrl();
    ctx.requestFactory.addParameter(
      new ModelParameter(ctx.parameterIndex, model),
    );
  });
}

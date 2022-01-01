import { TargetCtor, TargetProto } from "../internal/mod.ts";
import { setupRequestFactory } from "../ApiParameterization.ts";
import { setupApiDefaults } from "../ApiParameterization.ts";

export function RequestType(type: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(
        RequestType,
        target,
        method,
        (ctx) => (ctx.requestType = type),
      );
    }

    setupApiDefaults(
      RequestType,
      target,
      (parameters) => (parameters.requestType = type),
    );
  };
}

import { TargetCtor, TargetProto } from "../internal/mod.ts";
import { setupRequestFactory } from "../ApiParameterization.ts";
import { setupApiDefaults } from "../ApiParameterization.ts";

export function ResponseType(type: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(
        ResponseType,
        target,
        method,
        (ctx) => (ctx.responseType = type),
      );
    }

    setupApiDefaults(
      ResponseType,
      target,
      (parameters) => (parameters.responseType = type),
    );
  };
}

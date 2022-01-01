import {
  setupApiDefaults,
  setupRequestFactory,
} from "../../ApiParameterization.ts";
import { TargetCtor, TargetProto } from "../../internal/mod.ts";
import { HttpMethod } from "../../decorators/utils/mod.ts";

export const RetryOptionsKey = "retry:options";

export interface RetryOptions {
  limit: number;
  methods: HttpMethod[];
  statusCodes: number[];
  delay: number;
}

const Def: RetryOptions = {
  limit: 3,
  methods: ["GET", "HEAD", "PUT", "DELETE", "OPTIONS", "TRACE"],
  statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
  delay: 500,
};

export function Retry(options: Partial<RetryOptions> = Def) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(
        Retry,
        target,
        method,
        (requestFactory) => requestFactory.addConfig(RetryOptionsKey, options),
      );
    }

    setupApiDefaults(
      Retry,
      target,
      (defaults) =>
        defaults.addConfig(RetryOptionsKey, {
          limit: options.limit ?? Def.limit,
          delay: options.delay ?? Def.delay,
          methods: options.methods ?? Def.methods,
          statusCodes: options.statusCodes ?? Def.statusCodes,
        } as RetryOptions),
    );
  };
}

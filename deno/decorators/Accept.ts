import { setupRequestFactory } from "../ApiParameterization.ts";
import { setupApiDefaults } from "../ApiParameterization.ts";
import { HttpHeaders } from "../HttpHeaders.ts";
import { TargetCtor, TargetProto } from "../internal/mod.ts";

/**
 * Set Accept header in the request
 * Target: method
 *
 * @param value - accept header value
 */
export function Accept(value: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(
        Accept,
        target,
        method,
        (requestFactory) =>
          requestFactory.defaultHeaders.append(HttpHeaders.ACCEPT, value),
      );
    }

    setupApiDefaults(
      Accept,
      target,
      (parameters) => parameters.headers.append(HttpHeaders.ACCEPT, value),
    );
  };
}

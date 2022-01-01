import { setupRequestFactory } from "../ApiParameterization.ts";
import { setupApiDefaults } from "../ApiParameterization.ts";
import { HttpHeaders } from "../HttpHeaders.ts";
import { TargetCtor, TargetProto } from "../internal/mod.ts";

/**
 * Set Content-Type header in the request
 * Target: method
 *
 * @param value - content type header value
 */
export function ContentType(value: string) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(
        ContentType,
        target,
        method,
        (requestFactory) =>
          requestFactory.addDefaultHeader(HttpHeaders.CONTENT_TYPE, value),
      );
    }

    setupApiDefaults(
      ContentType,
      target,
      (parameters) =>
        parameters.headers.append(HttpHeaders.CONTENT_TYPE, value),
    );
  };
}

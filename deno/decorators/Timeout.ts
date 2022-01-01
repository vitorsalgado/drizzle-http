import { setupRequestFactory } from "../ApiParameterization.ts";
import { setupApiDefaults } from "../ApiParameterization.ts";
import { TargetCtor, TargetProto } from "../internal/mod.ts";

/**
 * Set the timeouts for an HTTP request.
 * It assumes that the HTTP client configured supports timeouts for a specific request.
 * Target: method
 *
 * @param readTimeoutInMs - timeout value before receiving complete body - MILLISECONDS
 * @param connectTimeoutInMs - timeout value before receiving complete params - MILLISECONDS
 */
export function Timeout(readTimeoutInMs = 30e3, connectTimeoutInMs = 30e3) {
  return (target: TargetProto | TargetCtor, method?: string) => {
    if (method) {
      return setupRequestFactory(Timeout, target, method, (requestFactory) => {
        requestFactory.readTimeout = readTimeoutInMs;
        requestFactory.connectTimeout = connectTimeoutInMs;
      });
    }

    setupApiDefaults(Timeout, target, (parameters) => {
      parameters.readTimeout = readTimeoutInMs;
      parameters.connectTimeout = connectTimeoutInMs;
    });
  };
}

import {
  setupApiDefaults,
  setupRequestFactory,
} from "../ApiParameterization.ts";
import { TargetCtor, TargetProto } from "../internal/mod.ts";
import { mergeHeaderWithObject } from "../HttpHeaders.ts";

/**
 * Adds fixed params to the request
 * Target: method
 *
 * @param headers - params object dictionary
 *
 * @example
 *  \@POST('/relative/path')
 *  \@HeadersMap(\{ CommonHeaders.CONTENT_TYPE: 'Application/new-content-type' \})
 *  example(\@Header('name') name: string): Promise<Result>
 */
export function HeaderMap(headers: Record<string, string>) {
  return function (target: TargetProto | TargetCtor, method?: string) {
    if (method) {
      return setupRequestFactory(
        HeaderMap,
        target,
        method,
        (requestFactory) => requestFactory.addDefaultHeaders(headers),
      );
    }

    setupApiDefaults(
      HeaderMap,
      target,
      (parameters) => mergeHeaderWithObject(parameters.headers, headers),
    );
  };
}

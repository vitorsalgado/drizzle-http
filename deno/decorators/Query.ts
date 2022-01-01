import { createParameterDecorator } from "../ApiParameterization.ts";
import { QueryParameter } from "../builtin/mod.ts";

/**
 * Query parameter appended to the URL.
 * Target: parameter
 *
 * @param key - query key
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@Header('name') name: string): Promise<Result>
 */
export function Query(key: string) {
  return createParameterDecorator(
    Query,
    (ctx) =>
      ctx.requestFactory.addParameter(
        new QueryParameter(key, ctx.parameterIndex),
      ),
  );
}

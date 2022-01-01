/**
 * Helper function used to avoid Lint and Typescript issues in api methods, since they don't need a body.
 * Just return the noop() function inside api methods, optionally passing all parameters.
 *
 * @param _args - api method arguments. Pass all arguments to avoid link issues.
 */
export function noop<T>(..._args: unknown[]) {
  return undefined as unknown as T;
}

/**
 * Utility functions to get the return type of decorated methods
 *
 * @remarks
 *
 * These functions should be applied in all decorated methods.
 * With the return types, we can detect which {@link ResponseConverter} and {@link CallAdapter} to use.
 * @packageDocumentation
 */

/**
 * Set the return types of decorated methods, including generic types.
 * This allows the discovery of important components like ResponseConverters, CallAdapters.
 * You can also provide the list of arguments to avoid link warnings.
 *
 * @param type - response type
 * @param genericType - response generic type. if generic type is an interface, provide null or undefined.
 * @param args - method arguments. used just to avoid lint errors
 *
 * @example
 *  \@GET('/relative/path/to/:id')
 *  example(\@Path('id') id: string): Promise<Response> \{
 *   return theTypes(Promise, Response)
 *  \}
 */
export function theTypes(
  type: { new (...args: any[]): any | void },
  genericType?: { new (...args: any[]): any | void } | null | undefined,
  ...args: any[]
): any {
  return [type, genericType]
}

/**
 * Set the return types of decorated methods, including generic types.
 * This allows the discovery of important components like ResponseConverters, CallAdapters.
 * You can also provide the list of arguments to avoid link warnings.
 * This is specific to functions with callback return type.
 *
 * @param genericType - response generic type. if generic type is an interface, provide null or undefined.
 * @param args - method arguments. used just to avoid lint errors
 *
 * @example
 *  \@GET('/relative/path/to/:id')
 *  \@Callback
 *  example(\@Path('id') id: string, callback: (err, data: Promise<Response>) \=\> void): void \{
 *   return callback(Promise, Response)
 *  \}
 */
export function callbackTypes(
  genericType?: { new (...args: any[]): any | void } | null | undefined,
  ...args: any[]
): any {
  return [null, genericType]
}

/**
 * Utility function used just to avoid lint problems on API methods that returns something,
 * like a Promise.
 * For methods with a generic return type that is not an Interface, use {@link theTypes}
 *
 * @param _args - method arguments. used just to avoid lint errors
 */
export function any(..._args: any[]): any {
  return undefined
}

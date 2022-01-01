import { decorateWithHttpMethod } from "./utils/mod.ts";

/**
 * Make a GET HTTP Request
 * Target: method
 *
 * @param path - relative path
 *
 * @example
 *  \@GET('/relative/path/to/:id')
 *  example(\@Param('id') id: string): Promise<any>
 */
export const GET = (path = "") => decorateWithHttpMethod(GET, "GET", path);

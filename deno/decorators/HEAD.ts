import { decorateWithHttpMethod } from "./utils/mod.ts";

/**
 * Make a HEAD HTTP Request
 * Target: method
 *
 * @param path - relative path
 *
 * @example
 *  \@HEAD('/relative/path')
 *  example(): Promise<any>
 */
export const HEAD = (path = "") => decorateWithHttpMethod(HEAD, "HEAD", path);

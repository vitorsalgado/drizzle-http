import { decorateWithHttpMethod } from './utils/index.ts'

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
export const HEAD = (path: string) => decorateWithHttpMethod(HEAD, 'HEAD', path)

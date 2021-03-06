import { decorateWithHttpMethod } from './utils'

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
export const HEAD = (path: string): any => decorateWithHttpMethod('HEAD', path)

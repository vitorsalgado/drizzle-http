import { decorateWithHttpMethod } from './utils'

/**
 * Make a HEAD HTTP Request
 * Target: method
 *
 * @param path - relative path
 *
 * @example
 *  \@OPTIONS('/relative/path')
 *  example(): Promise<any>
 */
export const OPTIONS = (path: string) => decorateWithHttpMethod(OPTIONS, 'OPTIONS', path)

import { decorateWithHttpMethod } from './utils/index.js'

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
export const OPTIONS = (path = '') => decorateWithHttpMethod(OPTIONS, 'OPTIONS', path)

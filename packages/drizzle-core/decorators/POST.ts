import { decorateWithHttpMethod } from './utils'

/**
 * Make a POST HTTP Request
 * Target: method
 *
 * @param path - relative path
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@Body data: object): Promise<Result>
 */
export const POST = (path = '') => decorateWithHttpMethod(POST, 'POST', path)

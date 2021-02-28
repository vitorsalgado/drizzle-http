import { decorateWithHttpMethod } from './utils'

/**
 * Make a PUT HTTP Request
 *
 * @param path - relative path
 *
 * @example
 *  \@PUT('/relative/path')
 *  example(\@Body data: object): Promise<Result>
 */
export const PUT = (path = ''): any => decorateWithHttpMethod('PUT', path)

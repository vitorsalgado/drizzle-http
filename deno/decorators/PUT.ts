import { decorateWithHttpMethod } from './utils/index.ts'

/**
 * Make a PUT HTTP Request
 *
 * @param path - relative path
 *
 * @example
 *  \@PUT('/relative/path')
 *  example(\@Body data: object): Promise<Result>
 */
export const PUT = (path: string) => decorateWithHttpMethod(PUT, 'PUT', path)

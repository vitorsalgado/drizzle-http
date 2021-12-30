import { decorateWithHttpMethod } from './utils/index.ts'

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
export const POST = (path: string) => decorateWithHttpMethod(POST, 'POST', path)
